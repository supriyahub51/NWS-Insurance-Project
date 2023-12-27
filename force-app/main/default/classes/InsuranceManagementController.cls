public class InsuranceManagementController
{
    @AuraEnabled
    public static list<Agent__c> getAgentrecord(string agentId)
    {
        list<Agent__c> agtList = [select id, Name, Agent_ID__c, DOB__c, Gender__c, Phone__c, Email__c, Registration_Date__c, Address__c from Agent__c where Agent_ID__c =: agentId];
        return agtList;
    }
    @AuraEnabled
    public static list<Policy_Holder__c> getAgentRelatedPHRecords(string agentId)
    {
        agent__c ag = [select id, Agent_ID__c from agent__c where 	Agent_ID__c =: agentId limit 1];
        list<Policy_Holder__c> phList = [select id, Name,Occupation__c, PH_ID__c, Phone__c, Income__c, Date_Of_Birth__c from Policy_Holder__c where Agent_Name__c =: ag.Id];
        return phList;
    }
    @AuraEnabled
    public static string insertPHRecord(string name, string gender, date dob, string phone, string email, string occupation, decimal income, string address){
       
        Policy_Holder__c ph = new Policy_Holder__c();
        ph.Name = name;
        ph.Gender__c = gender;
        ph.Date_Of_Birth__c = dob;
        ph.Phone__c = phone;
        ph.Email__c = email;
        ph.Occupation__c = occupation;
        ph.Income__c = income;
        ph.Address__c = address;
        try{
            insert ph;
            return 'success '+ph.Id;
        }
        catch(DmlException e){
            system.debug('exception is '+e.getMessage());
            return e.getMessage();
        }
    }
	@AuraEnabled
    public static wrapeLifeandMotor getRelaedPHRecords(string policyHolderId){
        wrapeLifeandMotor wlm = new wrapeLifeandMotor();
        list<Policy_Holder__c> phList = [select id, Name, (select id, Name, Policy_Type__c, Premium_Amount__c from 	Life_Insurances__r), (select id, Name,Policy_Type__c, Premium_Amount__c from 	Motor_Insurances__r) from Policy_Holder__c where PH_ID__c =:policyHolderId];
        for(Policy_Holder__c ph : phList)
        {
            if(ph.Life_Insurances__r.size() > 0){
               wlm.lifeInsu = ph.Life_Insurances__r; 
            }
            if(ph.Motor_Insurances__r.size() > 0){
                wlm.motorInsu = ph.Motor_Insurances__r;
            }
        }
        system.debug(wlm);
        return wlm;
    }
 
    public class wrapeLifeandMotor{
        @AuraEnabled
        public Life_Insurance__c lifeInsu{get;set;}
        @AuraEnabled
        public Motor_Insurance__c motorInsu{get;set;}
    }
}