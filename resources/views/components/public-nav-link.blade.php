@props(['href', 'active' => false])

<a href="{{ $href }}" {{ $attributes->merge(['class' => 'text-sm font-bold uppercase tracking-wide '.($active ? 'text-accent' : 'text-ink hover:text-accent')]) }}>
    {{ $slot }}
</a>
