const breakpoints = {
    xs: '575px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1320px',
}

export const xs = `@media screen and (max-width: ${breakpoints.xs})`
export const sm = `@media screen and (min-width: ${breakpoints.sm})`
export const md = `@media screen and (min-width: ${breakpoints.md})`
export const lg = `@media screen and (min-width: ${breakpoints.lg})`
export const xl = `@media screen and (min-width: ${breakpoints.xl})`
export const xxl = `@media screen and (min-width: ${breakpoints.xxl})`