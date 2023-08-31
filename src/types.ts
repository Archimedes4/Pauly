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

export enum resourceResponce {
    found,
    notFound,
    failed
  }

declare global {
    type TaskType = {
        name: string
        id: string
        listId: string
        importance: taskImportanceEnum
    }
}