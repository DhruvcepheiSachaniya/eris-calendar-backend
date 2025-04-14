export class EditSessionDto {
    sessionId: number; // Required to identify which session to edit
    Study?: string;     // Optional fields for updating
    empCode?: string;
    drCode?: string;
    date?: Date;
    startTime?: Date;
    endTime?: Date;
    select_reason?: string;
}