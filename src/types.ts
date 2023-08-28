export enum loadingStateEnum {
    loading,
    success,
    failed,
    notStarted,
    cannotStart,
    offline
}

export enum dataContentTypeOptions {
    video,
    image,
    pdf,
    unknown
}

export enum taskImportanceEnum {
    low,
    normal,
    high
}

declare global {
    type TaskType = {
        name: string
        id: string
        listId: string
        importance: taskImportanceEnum
    }
}