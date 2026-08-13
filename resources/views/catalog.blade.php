<x-layouts::app :title="$category === 'neuf' ? 'Pièces neuves' : 'Occasion — France au revoir'">
    <livewire:catalog :category="$category" :key="$category" />
</x-layouts::app>
