public class InsuranceHandler
{
 @AuraEnabled
    public static Id insertAgent(string name, date dob, string gender, string phone, string email, date regdate, string address)
    {
       
        Agent__c ag= new Agent__c();
        ag.Name=name;
        ag.DOB__c=dob;
        ag.Gender__c=gender;
        ag.Phone__c=phone;
        ag.Email__c=email;
        ag.Registration_Date__c=regdate;
        ag.Address__c=address;
        insert ag;
        return ag.Id;
    }
}