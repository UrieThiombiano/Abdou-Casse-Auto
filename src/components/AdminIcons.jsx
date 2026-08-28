// Icones de la barre laterale admin : traits fins (style Feather), coherentes
// et adaptees a chaque section plutot que des pictos generiques.

function Icon({ children, className = 'w-5 h-5' }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {children}
        </svg>
    )
}

export function IconDashboard(props) {
    return (
        <Icon {...props}>
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
        </Icon>
    )
}

export function IconListings(props) {
    return (
        <Icon {...props}>
            <path d="M21 8 12 3 3 8l9 5 9-5Z" />
            <path d="M3 8v8l9 5 9-5V8" />
            <path d="M12 13v8" />
        </Icon>
    )
}

export function IconOrdersOnline(props) {
    return (
        <Icon {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18" />
            <path d="M12 3a14 14 0 0 1 3.5 9A14 14 0 0 1 12 21a14 14 0 0 1-3.5-9A14 14 0 0 1 12 3Z" />
        </Icon>
    )
}

export function IconOrderBook(props) {
    return (
        <Icon {...props}>
            <path d="M9 3h6a1.5 1.5 0 0 1 1.5 1.5V5h-9v-.5A1.5 1.5 0 0 1 9 3Z" />
            <rect x="5" y="5" width="14" height="16" rx="2" />
            <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" />
        </Icon>
    )
}

export function IconPartRequests(props) {
    return (
        <Icon {...props}>
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M20 20l-4.3-4.3" />
        </Icon>
    )
}

export function IconProforma(props) {
    return (
        <Icon {...props}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8L14 2Z" />
            <path d="M14 2v6h6" />
            <path d="M8.5 13h7M8.5 16.5h7M8.5 9.5h2" />
        </Icon>
    )
}

export function IconRepairs(props) {
    return (
        <Icon {...props}>
            <path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4l-2.5 2.5-2-2Z" />
        </Icon>
    )
}

export function IconChevronLeft(props) {
    return (
        <Icon {...props}>
            <path d="M15 18l-6-6 6-6" />
        </Icon>
    )
}

export function IconChevronRight(props) {
    return (
        <Icon {...props}>
            <path d="M9 18l6-6-6-6" />
        </Icon>
    )
}

export function IconLogout(props) {
    return (
        <Icon {...props}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
        </Icon>
    )
}

export function IconMenu(props) {
    return (
        <Icon {...props}>
            <path d="M3 6h18M3 12h18M3 18h18" />
        </Icon>
    )
}
