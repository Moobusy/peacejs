export interface App {
    auth: Auth
}

export interface Auth {
    nodes: string[]
    group: string
}