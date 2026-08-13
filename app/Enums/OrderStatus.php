<?php

namespace App\Enums;

enum OrderStatus: string
{
    case EnAttente = 'en_attente';
    case Traitee = 'traitee';
    case Annulee = 'annulee';

    public function label(): string
    {
        return match ($this) {
            self::EnAttente => 'En attente',
            self::Traitee => 'Traitée',
            self::Annulee => 'Annulée',
        };
    }
}
