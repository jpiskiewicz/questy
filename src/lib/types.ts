export enum QuestType {
  Main = "main",
  Side = "side"
}

export enum QuestStatus {
  Created = "created",
  Started = "started",
  Finished = "finished"
}

export interface Quest {
  id: number;
  user: string;
  type: QuestType;
  title: string;
  description: string;
  duration: number;
  status: QuestStatus;
  end_time: string;
}
