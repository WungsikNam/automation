export interface TicketData {
  request_id: string;
  ticket_type: string;
  ticket_title: string;
  ticket_description: string;
  assignee: string;
  start_date: string;
  due_date: string;
  story_point: string;
  requester_id: string;
  requester_name: string;
  status: string;
  jira_key: string;
  timestamp: string;
}

export interface DiscordInteraction {
  type: number;
  data?: {
    custom_id?: string;
    components?: Array<{
      type: number;
      components: Array<{
        type: number;
        custom_id: string;
        value: string;
      }>;
    }>;
  };
  member?: {
    user: {
      id: string;
      username: string;
    };
  };
  user?: {
    id: string;
    username: string;
  };
}

export interface ModalComponent {
  type: number;
  components: Array<{
    type: number;
    custom_id: string;
    label: string;
    style: number;
    min_length: number;
    max_length: number;
    placeholder: string;
    required: boolean;
  }>;
}

export interface DiscordResponse {
  type: number;
  data?: {
    title?: string;
    custom_id?: string;
    components?: ModalComponent[];
    content?: string;
    flags?: number;
  };
}
