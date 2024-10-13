export enum QuestType {
  main = "main",
  side = "side"
}

enum QuestStatus {
  created = "created",
  started = "started",
  finished = "finished"
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
