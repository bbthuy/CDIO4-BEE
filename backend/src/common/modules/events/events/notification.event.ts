export class NotifyProjectInvitedEvent {
  // eslint-disable-next-line prettier/prettier
  constructor(
    public readonly userId: number,
    public readonly message: string,
    public readonly notifiableId: number,
    public readonly metaData?: any
  ) {}
}

export class NotifyProjectUpdatedRoleEvent {
  // eslint-disable-next-line prettier/prettier
  constructor(
    public readonly userId: number,
    public readonly message: string,
    public readonly notifiableId: number,
    public readonly metaData?: any
  ) {}
}
