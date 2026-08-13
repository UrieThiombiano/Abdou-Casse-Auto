@props(['href', 'active' => false])

<a href="{{ $href }}" {{ $attributes->merge(['class' => 'flex items-center gap-3 px-4 py-2.5 text-sm font-bold uppercase tracking-wide '.($active ? 'bg-accent text-white' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white')]) }}>
    {{ $slot }}
</a>
