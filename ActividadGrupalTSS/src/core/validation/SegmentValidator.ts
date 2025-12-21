import * as math from 'mathjs';

export interface Segment {
  id: string;
  xmin: number;
  xmax: number;
  formula: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  suggestions: SuggestionFix[];
  originalAreas: number[];
  normalizedAreas: number[];
  totalArea: number;
  normalizationFactor: number;
  negativeValues: NegativeRegion[];
}

export interface ValidationIssue {
  type: 'formula_error' | 'negative_values' | 'disconnection' | 'non_monotonic' | 'zero_area';
  severity: 'error' | 'warning';
  segment: string;
  description: string;
  details?: string;
}

export interface SuggestionFix {
  segment: string;
  action: 'scale' | 'shift' | 'replace' | 'clamp';
  originalFormula: string;
  suggestedFormula: string;
  reason: string;
  confidence: number; // 0-1
}

export interface NegativeRegion {
  segment: string;
  xmin: number;
  xmax: number;
  minValue: number;
  percentage: number; // Porcentaje del intervalo con valores negativos
}

/**
 * Validador y "excavador" de segmentos para asegurar que formen una distribución válida
 */
export class SegmentValidator {
  private static INTEGRATION_STEPS = 1000;
  private static SAMPLING_POINTS = 50;
  private static NEGATIVE_THRESHOLD = 1e-10;

  /**
   * Integración numérica usando regla del trapecio
   */
  static numericalIntegration(
    formula: string,
    xmin: number,
    xmax: number,
    steps: number = this.INTEGRATION_STEPS
  ): number {
    const h = (xmax - xmin) / steps;
    let sum = 0;

    try {
      for (let i = 0; i <= steps; i++) {
        const x = xmin + i * h;
        const y = math.evaluate(formula, { x }) as number;

        if (i === 0 || i === steps) {
          sum += y * 0.5;
        } else {
          sum += y;
        }
      }
      return Math.abs(sum * h);
    } catch {
      return 0;
    }
  }

  /**
   * Validación completa de segmentos
   */
  static validateSegments(segments: Segment[]): ValidationResult {
    const issues: ValidationIssue[] = [];
    const suggestions: SuggestionFix[] = [];
    const originalAreas: number[] = [];
    const negativeValues: NegativeRegion[] = [];

    // 1. Validar sintaxis de fórmulas y detectar valores negativos
    segments.forEach((seg) => {
      // Validar sintaxis
      try {
        math.evaluate(seg.formula, { x: (seg.xmin + seg.xmax) / 2 });
      } catch (e) {
        issues.push({
          type: 'formula_error',
          severity: 'error',
          segment: seg.id,
          description: `Fórmula inválida: "${seg.formula}"`,
          details: String(e),
        });
        return;
      }

      // Detectar valores negativos
      const negativeInfo = this.detectNegativeValues(seg);
      if (negativeInfo.hasNegatives) {
        negativeValues.push(...negativeInfo.regions);
        issues.push({
          type: 'negative_values',
          severity: 'error',
          segment: seg.id,
          description: `Detectados valores negativos en ${negativeInfo.regions.length} región(es)`,
          details: `${(negativeInfo.percentage * 100).toFixed(1)}% del intervalo tiene valores < 0`,
        });
      }

      // Calcular área
      const area = this.numericalIntegration(seg.formula, seg.xmin, seg.xmax);
      originalAreas.push(area);

      // Detectar área cero
      if (Math.abs(area) < 1e-10) {
        issues.push({
          type: 'zero_area',
          severity: 'error',
          segment: seg.id,
          description: 'El segmento tiene área prácticamente cero',
        });
      }
    });

    // 2. Calcular total y normalizar
    const totalArea = originalAreas.reduce((a, b) => Math.max(0, a) + Math.max(0, b), 0);
    const normalizationFactor = totalArea > 0 ? 1 / totalArea : 1;
    const normalizedAreas = originalAreas.map((a) => Math.max(0, a) * normalizationFactor);

    // 3. Validar continuidad y conexión entre segmentos
    segments.forEach((seg, idx) => {
      if (idx < segments.length - 1) {
        const nextSeg = segments[idx + 1];
        
        // Verificar si hay brecha
        if (Math.abs(seg.xmax - nextSeg.xmin) > 1e-6) {
          issues.push({
            type: 'disconnection',
            severity: 'warning',
            segment: seg.id,
            description: `Brecha entre segmento ${seg.id} y ${nextSeg.id}`,
            details: `Brecha de ${Math.abs(seg.xmax - nextSeg.xmin).toFixed(6)} unidades`,
          });
        }

        // Validar si se superponen
        if (seg.xmax > nextSeg.xmin) {
          issues.push({
            type: 'disconnection',
            severity: 'error',
            segment: seg.id,
            description: `Superposición entre segmento ${seg.id} y ${nextSeg.id}`,
          });
        }
      }
    });

    // 4. Generar sugerencias de ajuste
    if (issues.length > 0) {
      suggestions.push(...this.generateSuggestions(segments, originalAreas, negativeValues));
    }

    const isValid = issues.filter((i) => i.severity === 'error').length === 0;

    return {
      isValid,
      issues,
      suggestions,
      originalAreas,
      normalizedAreas,
      totalArea,
      normalizationFactor,
      negativeValues,
    };
  }

  /**
   * Detecta regiones con valores negativos en un segmento
   */
  private static detectNegativeValues(
    segment: Segment
  ): { hasNegatives: boolean; percentage: number; regions: NegativeRegion[] } {
    const regions: NegativeRegion[] = [];
    let negativeCount = 0;
    let minValue = Infinity;

    const points = this.SAMPLING_POINTS;
    const step = (segment.xmax - segment.xmin) / points;

    for (let i = 0; i <= points; i++) {
      const x = segment.xmin + i * step;
      try {
        const y = math.evaluate(segment.formula, { x }) as number;
        if (y < -this.NEGATIVE_THRESHOLD) {
          negativeCount++;
          minValue = Math.min(minValue, y);
        }
      } catch {
        // Ignorar errores de evaluación
      }
    }

    const hasNegatives = negativeCount > 0;
    const percentage = negativeCount / points;

    if (hasNegatives) {
      regions.push({
        segment: segment.id,
        xmin: segment.xmin,
        xmax: segment.xmax,
        minValue,
        percentage,
      });
    }

    return { hasNegatives, percentage, regions };
  }

  /**
   * Genera sugerencias automáticas para "escavar" y ajustar segmentos
   */
  private static generateSuggestions(
    segments: Segment[],
    areas: number[],
    negativeRegions: NegativeRegion[]
  ): SuggestionFix[] {
    const suggestions: SuggestionFix[] = [];

    // Sugerencia 1: Si hay valores negativos, usar valor absoluto
    negativeRegions.forEach((region) => {
      const seg = segments.find((s) => s.id === region.segment);
      if (seg) {
        suggestions.push({
          segment: seg.id,
          action: 'replace',
          originalFormula: seg.formula,
          suggestedFormula: `abs(${seg.formula})`,
          reason: `Aplicar valor absoluto para eliminar negativos (${(region.percentage * 100).toFixed(1)}% del intervalo)`,
          confidence: 0.7,
        });

        // Sugerencia alternativa: desplazar hacia arriba
        const minVal = region.minValue;
        const shift = Math.abs(minVal) + 0.1;
        suggestions.push({
          segment: seg.id,
          action: 'shift',
          originalFormula: seg.formula,
          suggestedFormula: `${seg.formula} + ${shift.toFixed(4)}`,
          reason: `Desplazar fórmula hacia arriba para eliminar negativos`,
          confidence: 0.5,
        });
      }
    });

    // Sugerencia 2: Si el área total es muy pequeña, escalar la fórmula
    const totalArea = areas.reduce((a, b) => a + b, 0);
    if (totalArea > 0 && totalArea < 0.1) {
      segments.forEach((seg, idx) => {
        if (areas[idx] > 0) {
          const scale = Math.ceil(1 / totalArea / 10);
          suggestions.push({
            segment: seg.id,
            action: 'scale',
            originalFormula: seg.formula,
            suggestedFormula: `${scale}*(${seg.formula})`,
            reason: `Escalar fórmula para aumentar el área total (actual: ${totalArea.toFixed(4)})`,
            confidence: 0.8,
          });
        }
      });
    }

    // Sugerencia 3: Si hay segmentos con área muy pequeña, revisar la fórmula
    segments.forEach((seg, idx) => {
      if (areas[idx] > 0 && areas[idx] < 0.01 && totalArea > 0.1) {
        suggestions.push({
          segment: seg.id,
          action: 'scale',
          originalFormula: seg.formula,
          suggestedFormula: `10*(${seg.formula})`,
          reason: `El segmento contribuye muy poco al área total (${(areas[idx] * 100).toFixed(2)}%)`,
          confidence: 0.6,
        });
      }
    });

    return suggestions;
  }

  /**
   * Aplica una sugerencia de ajuste automáticamente
   */
  static applySuggestion(
    segment: Segment,
    suggestion: SuggestionFix
  ): Segment {
    return {
      ...segment,
      formula: suggestion.suggestedFormula,
    };
  }

  /**
   * Intenta "escavar" automáticamente todos los problemas encontrados
   */
  static autoExcavate(segments: Segment[]): {
    fixedSegments: Segment[];
    appliedFixes: Array<{ segmentId: string; suggestion: SuggestionFix }>;
  } {
    const working = [...segments];
    const appliedFixes: Array<{ segmentId: string; suggestion: SuggestionFix }> = [];

    // Iterar hasta que no haya errores críticos o lleguemos al máximo de iteraciones
    for (let iteration = 0; iteration < 3; iteration++) {
      const validation = this.validateSegments(working);

      if (validation.isValid) break;

      // Aplicar las sugerencias con mayor confianza
      const topSuggestions = validation.suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, working.length);

      topSuggestions.forEach((suggestion) => {
        const idx = working.findIndex((s) => s.id === suggestion.segment);
        if (idx >= 0) {
          working[idx] = this.applySuggestion(working[idx], suggestion);
          appliedFixes.push({ segmentId: suggestion.segment, suggestion });
        }
      });
    }

    return { fixedSegments: working, appliedFixes };
  }

  /**
   * Genera un reporte detallado de validación
   */
  static generateReport(validation: ValidationResult): string {
    let report = `=== REPORTE DE VALIDACIÓN ===\n\n`;

    report += `Estado General: ${validation.isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}\n`;
    report += `Área Total: ${validation.totalArea.toFixed(6)}\n`;
    report += `Factor de Normalización: ${validation.normalizationFactor.toFixed(6)}\n\n`;

    if (validation.issues.length === 0) {
      report += `No se encontraron problemas.\n`;
    } else {
      report += `Problemas Encontrados (${validation.issues.length}):\n`;
      validation.issues.forEach((issue, idx) => {
        report += `\n${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.type}\n`;
        report += `   Segmento: ${issue.segment}\n`;
        report += `   ${issue.description}\n`;
        if (issue.details) report += `   Detalles: ${issue.details}\n`;
      });
    }

    if (validation.suggestions.length > 0) {
      report += `\n\nSugerencias de Ajuste (${validation.suggestions.length}):\n`;
      validation.suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .forEach((sug, idx) => {
          report += `\n${idx + 1}. ${sug.action.toUpperCase()} (Confianza: ${(sug.confidence * 100).toFixed(0)}%)\n`;
          report += `   Segmento: ${sug.segment}\n`;
          report += `   Original: ${sug.originalFormula}\n`;
          report += `   Sugerido: ${sug.suggestedFormula}\n`;
          report += `   Razón: ${sug.reason}\n`;
        });
    }

    return report;
  }
}
