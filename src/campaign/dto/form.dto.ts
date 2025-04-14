export default interface form_feilds_list {
    field_name: string,
    field_type: string,
    field_order: number,
    create_at: Date,
}
export class CreateFormDto {
    CampaignName: string
    FormMasterName: string
    form_description: string
    form_feilds: form_feilds_list[]
}