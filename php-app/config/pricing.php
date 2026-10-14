<?php
/**
 * ParkFlow - Calculadora de Tarifas y Liquidación de Cobros en PHP
 */

function calculateParkingFee($entryTimeStr, $exitTimeStr, $rate, $isLostTicket = false, $discountPercent = 0) {
    $entry = new DateTime($entryTimeStr);
    $exit = new DateTime($exitTimeStr);

    $diff = $entry->diff($exit);
    $totalMinutes = ($diff->days * 24 * 60) + ($diff->h * 60) + $diff->i;
    if ($totalMinutes < 1) {
        $totalMinutes = 1;
    }

    $gracePeriod = (int)$rate['grace_period_minutes'];
    $graceApplied = false;
    $baseCharge = 0;

    // Si está dentro del período de cortesía
    if ($totalMinutes <= $gracePeriod) {
        $graceApplied = true;
        $baseCharge = 0;
    } else {
        $ratePerMinute = (float)$rate['rate_per_minute'];
        $ratePerFraction15m = (float)$rate['rate_per_fraction15m'];
        $ratePerHour = (float)$rate['rate_per_hour'];
        $ratePerDay = (float)$rate['rate_per_day'];

        // Si supera 12 horas, se aplica tarifa día por cada bloque de 24 horas
        if ($totalMinutes >= 720) {
            $days = ceil($totalMinutes / 1440);
            $baseCharge = $days * $ratePerDay;
        } elseif ($totalMinutes >= 60) {
            // Horas completas más minutos restantes o fracciones
            $hours = floor($totalMinutes / 60);
            $remainingMinutes = $totalMinutes % 60;

            $hourCharge = $hours * $ratePerHour;
            $fractionCount = ceil($remainingMinutes / 15);
            $remainingCharge = min($fractionCount * $ratePerFraction15m, $ratePerHour);

            $baseCharge = $hourCharge + $remainingCharge;
        } else {
            // Menos de una hora: cálculo por fracciones de 15 minutos
            $fractions = ceil($totalMinutes / 15);
            $baseCharge = min($fractions * $ratePerFraction15m, $ratePerHour);
        }
    }

    $subtotal = $baseCharge;
    if ($isLostTicket) {
        $subtotal += (float)$rate['lost_ticket_fee'];
    }

    $discountAmount = 0;
    if ($discountPercent > 0 && $discountPercent <= 100) {
        $discountAmount = round(($subtotal * $discountPercent) / 100);
    }

    $total = max(0, $subtotal - $discountAmount);

    return [
        'totalMinutes' => $totalMinutes,
        'graceApplied' => $graceApplied,
        'baseCharge' => $baseCharge,
        'lostTicketCharge' => $isLostTicket ? (float)$rate['lost_ticket_fee'] : 0,
        'discount' => $discountAmount,
        'total' => $total
    ];
}
