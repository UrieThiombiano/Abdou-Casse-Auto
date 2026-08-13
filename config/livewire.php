<?php

return [
    // On injecte @livewireStyles/@livewireScripts explicitement dans les
    // layouts (public + admin) pour garantir Alpine/Livewire meme sur les
    // pages sans composant Livewire (ex: accueil, fiche produit, contact).
    // L'auto-injection est donc desactivee pour eviter un double chargement
    // sur les pages qui, elles, contiennent un composant Livewire.
    'inject_assets' => false,
];
