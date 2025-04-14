import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Campaign } from "src/entity/campaign.entity";
import { Repository } from "typeorm";

@Injectable({})
export class CampaignService {
    constructor(
        @InjectRepository(Campaign)
        private readonly campaignRepository: Repository<Campaign>,
    ) { }

    async PostCampaign(name: string, description: string) {
        try {
            const find_campaign = await this.campaignRepository.findOne({
                where: {
                    name: name,
                }
            })

            if (find_campaign) {
                throw new HttpException("Campaign already exist", HttpStatus.BAD_REQUEST)
            }

            const campaign = new Campaign();
            campaign.name = name;
            campaign.description = description;
            campaign.created_at = new Date();
            // campaign.updated_at = new Date();

            const new_campaign = await this.campaignRepository.save(campaign);

            return {
                status: "success",
                new_campaign
            };

        } catch (err) {
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getAllCampaign() {
        try {
            const all_campaign = await this.campaignRepository.find();

            if (!all_campaign) {
                throw new HttpException("No Campaign found", HttpStatus.NOT_FOUND)
            }

            return {
                status: "success",
                all_campaign
            };
        } catch (err) {
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // async CreateCampaignBasedForm(dto: CreateFormDto) {
    //     try {
    //         //Get the Campaign First
    //         const Campaign = await this.campaignRepository.findOne({
    //             where: {
    //                 name: dto.CampaignName,
    //             }
    //         })

    //         if (!Campaign) {
    //             throw new HttpException("Campaign not found", HttpStatus.NOT_FOUND)
    //         }

    //         // ! what if campaign already has a form_master?

    //         //TODO:- First create a campaign form_master
    //         const new_form_master = new FormMaster();
    //         new_form_master.campaign = Campaign
    //         new_form_master.form_name = dto.FormMasterName
    //         new_form_master.form_description = dto.form_description
    //         new_form_master.created_at = new Date()

    //         const form_master = await this.formMasterRepository.save(new_form_master);

    //         if (!form_master) {
    //             throw new HttpException("Error creating form master", HttpStatus.INTERNAL_SERVER_ERROR)
    //         }
            
    //         //TODO2: - Second create a campaign master based form feilds
    //         // ! form feilds will be created by map
    //         const saved_feilds = await Promise.all(dto.form_feilds.map(async (field: any) => {
    //             const new_form_field = new FormFields();
    //             new_form_field.form_master = form_master;
    //             new_form_field.field_name = field.field_name;
    //             new_form_field.field_type = field.field_type;
    //             new_form_field.field_order = field.field_order;
    //             new_form_field.created_at = new Date();

    //             await this.formFieldsRepository.save(new_form_field);
    //         }))

    //         if (saved_feilds.length === 0) {
    //             throw new HttpException("Error creating form field", HttpStatus.INTERNAL_SERVER_ERROR)
    //         }

    //         return {
    //             status: "success",
    //             form_master,
    //             form_feilds: saved_feilds,
    //         }

    //     } catch (err) {
    //         throw new HttpException(
    //             err instanceof HttpException ? err.getResponse() : "Internal Server Error",
    //             err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    //         );
    //     }
    // }

    // async GetCampaignBasedForm (campaignName: string) {
    //     try {
    //         // firt find campaign
    //         const campaign = await this.campaignRepository.findOne({
    //             where: {
    //                 name: campaignName
    //             },
    //             relations: ['form_masters']
    //         })

    //         if (!campaign) {
    //             throw new HttpException("Campaign not found", HttpStatus.NOT_FOUND)
    //         }

    //         const form_fields = await this.formFieldsRepository.find({
    //             where: {
    //                 form_master: campaign.form_masters[0],// ! for now take first one
    //             }
    //         })

    //         return {
    //             status: "success",
    //             data: {
    //                 form_fields
    //             }
    //         }
    //     } catch (err) {
    //         throw new HttpException(
    //             err instanceof HttpException ? err.getResponse() : "Internal Server Error",
    //             err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    //         );
    //     }
    // }

    // async UpdateCampaignBasedForm(dto: CreateFormDto) {
    //     try {
    //         // 1. Find campaign with form_master relation
    //         const campaign = await this.campaignRepository.findOne({
    //             where: {
    //                 name: dto.CampaignName
    //             },
    //             relations: ['form_masters']
    //         });
    
    //         if (!campaign) {
    //             throw new HttpException("Campaign not found", HttpStatus.NOT_FOUND);
    //         }
    
    //         // 2. Check if form_master exists (unlike create, this is required for update)
    //         if (!campaign.form_masters || campaign.form_masters.length === 0) {
    //             throw new HttpException("Form master not found for this campaign", HttpStatus.NOT_FOUND);
    //         }
    
    //         const form_master = campaign.form_masters[0];
    
    //         // 3. Get existing fields
    //         const existing_fields = await this.formFieldsRepository.find({
    //             where: {
    //                 form_master: form_master
    //             }
    //         });
    
    //         // 4. Update form master metadata
    //         form_master.form_name = dto.FormMasterName || form_master.form_name;
    //         form_master.form_description = dto.form_description || form_master.form_description;
    //         await this.formMasterRepository.save(form_master);
    
    //         // 5. Update fields - complex logic needed for:
    //         // ?   - New fields (create)
    //         // ?   - Existing fields (update)
    //         //  ?  - Removed fields (delete)

    //         const updated_fields = await this.syncFormFields(
    //             form_master, 
    //             dto.form_feilds, 
    //             existing_fields
    //         );
    
    //         return {
    //             status: "success",
    //             form_master,
    //             updated_fields
    //         };
    
    //     } catch (err) {
    //         throw new HttpException(
    //             err instanceof HttpException ? err.getResponse() : "Internal Server Error",
    //             err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    //         );
    //     }
    // }
    
    // private async syncFormFields(
    //     form_master: FormMaster,
    //     new_fields: form_feilds_list[],
    //     existing_fields: FormFields[]
    // ): Promise<FormFields[]> {
    //     // 1. Create a map of existing fields by field_name for quick lookup
    //     const existingFieldMap = new Map<string, FormFields>();
    //     existing_fields.forEach(field => {
    //         existingFieldMap.set(field.field_name, field);
    //     });
    
    //     // 2. Process each new field
    //     const results: FormFields[] = [];
        
    //     for (const new_field of new_fields) {
    //         // Case 1: Field exists - update it
    //         if (existingFieldMap.has(new_field.field_name)) {
    //             const existingField = existingFieldMap.get(new_field.field_name);
                
    //             existingField.field_type = new_field.field_type;
    //             existingField.field_order = new_field.field_order;
                
    //             const updated = await this.formFieldsRepository.save(existingField);
    //             results.push(updated);
    //             existingFieldMap.delete(new_field.field_name); // Mark as processed
    //         } 
    //         // Case 2: New field - create it
    //         else {
    //             const created = await this.formFieldsRepository.save({
    //                 form_master,
    //                 field_name: new_field.field_name,
    //                 field_type: new_field.field_type,
    //                 field_order: new_field.field_order,
    //                 created_at: new Date()
    //             });
    //             results.push(created);
    //         }
    //     }
    
    //     // 3. Delete fields that weren't in the new payload (left in existingFieldMap)
    //     const fieldsToDelete = Array.from(existingFieldMap.values());
    //     if (fieldsToDelete.length > 0) {
    //         await this.formFieldsRepository.remove(fieldsToDelete);
    //     }
    
    //     return results;
    // }
}