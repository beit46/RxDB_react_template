export type TaskUUID = string;
export type Task = {
    uuid: TaskUUID,
    name: string,
    description: string
}

export type TaskDTO = Task & {
    id: string,
}