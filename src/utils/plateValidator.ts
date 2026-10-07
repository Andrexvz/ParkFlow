import { VehicleType } from '../types';

export interface PlateValidationResult {
  isValid: boolean;
  formattedPlate: string;
  detectedType?: VehicleType;
  errorMessage?: string;
}

/**
 * Validador de placas según normatividad de tránsito en Colombia
 */
export function validateAndFormatPlate(rawPlate: string, expectedType?: VehicleType): PlateValidationResult {
  if (!rawPlate) {
    return {
      isValid: false,
      formattedPlate: '',
      errorMessage: 'La placa es requerida'
    };
  }

  // Limpiar espacios y guiones, convertir a mayúsculas
  const clean = rawPlate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  // Si es bicicleta o movilidad eléctrica alternativa
  if (expectedType === 'bicicleta') {
    if (clean.length < 2) {
      return {
        isValid: false,
        formattedPlate: clean,
        detectedType: 'bicicleta',
        errorMessage: 'Identificador de bicicleta muy corto (mínimo 2 caracteres)'
      };
    }
    return {
      isValid: true,
      formattedPlate: clean.startsWith('B-') ? clean : `B-${clean}`,
      detectedType: 'bicicleta'
    };
  }

  // Regex Colombia:
  // Auto/Camioneta: 3 letras + 3 dígitos (ej: AAA000 a ZZZ999)
  const carRegex = /^[A-Z]{3}[0-9]{3}$/;

  // Moto moderna: 3 letras + 2 dígitos + 1 letra (ej: AAA00A)
  const motoModernRegex = /^[A-Z]{3}[0-9]{2}[A-Z]$/;

  // Moto clásica: 3 letras + 2 dígitos (ej: AAA00)
  const motoClassicRegex = /^[A-Z]{3}[0-9]{2}$/;

  let isValid = false;
  let detectedType: VehicleType | undefined;
  let formatted = clean;

  if (carRegex.test(clean)) {
    isValid = true;
    detectedType = 'automovil';
    formatted = `${clean.slice(0, 3)}-${clean.slice(3)}`;
  } else if (motoModernRegex.test(clean)) {
    isValid = true;
    detectedType = 'motocicleta';
    formatted = `${clean.slice(0, 3)}-${clean.slice(3)}`;
  } else if (motoClassicRegex.test(clean)) {
    isValid = true;
    detectedType = 'motocicleta';
    formatted = `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }

  if (!isValid) {
    let msg = 'Formato de placa colombiana inválido.';
    if (expectedType === 'automovil' || expectedType === 'camioneta') {
      msg = 'Debe tener 3 letras y 3 números (Ej: ABC-123).';
    } else if (expectedType === 'motocicleta') {
      msg = 'Debe tener 3 letras, 2 números y 1 letra (Ej: ABC-12D) o 3 letras y 2 números (Ej: ABC-12).';
    } else {
      msg = 'Ejemplo autos: ABC-123 | Ejemplo motos: ABC-12D';
    }

    return {
      isValid: false,
      formattedPlate: clean,
      detectedType,
      errorMessage: msg
    };
  }

  // Si el usuario especificó camioneta pero el regex coincide con auto (mismo formato de placa en Colombia)
  if (expectedType === 'camioneta' && detectedType === 'automovil') {
    detectedType = 'camioneta';
  }

  // Verificar concordancia con el tipo esperado si se proveyó
  if (expectedType && expectedType !== 'camioneta') {
    if (expectedType === 'automovil' && detectedType === 'motocicleta') {
      return {
        isValid: false,
        formattedPlate: formatted,
        detectedType,
        errorMessage: 'Esta placa corresponde a una Motocicleta, no a un Automóvil.'
      };
    }
    if (expectedType === 'motocicleta' && detectedType === 'automovil') {
      return {
        isValid: false,
        formattedPlate: formatted,
        detectedType,
        errorMessage: 'Esta placa corresponde a un Automóvil, no a una Motocicleta.'
      };
    }
  }

  return {
    isValid: true,
    formattedPlate: formatted,
    detectedType: expectedType || detectedType
  };
}
