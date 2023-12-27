import { LightningElement, track } from 'lwc';
import INSURANCE_IMAGE from '@salesforce/resourceUrl/Insurance';
import getRelaedPHRecords from '@salesforce/apex/InsuranceManagementController.getRelaedPHRecords';
import getAgentrecord from '@salesforce/apex/InsuranceManagementController.getAgentrecord';
import getAgentRelatedPHRecords from '@salesforce/apex/InsuranceManagementController.getAgentRelatedPHRecords';
import insertPHRecord from '@salesforce/apex/InsuranceManagementController.insertPHRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import checkAdminData from '@salesforce/apex/AdminLogin.checkAdminData';

const COLUMNSS = [
    {label : 'Policy Holder Id', fieldName: 'PH_ID__c', type : 'text'},
    {label : 'Name', fieldName: 'Name', type : 'text'},
    {label : 'Occupation__c', fieldName: 'Occupation__c', type : 'text'},
    {label : 'Date_Of_Birth__c', fieldName: 'Date_Of_Birth__c', type : 'date'},
    {label : 'Phone', fieldName: 'Phone__c', type : 'phone'},

];
const COLUMNS = [
    {label : 'Policy Id', fieldName: 'Name', type : 'text'},
    {label : 'Policy Type', fieldName: 'Policy_Type__c', type : 'text'},
    {label : 'Premium Amount', fieldName: 'Premium_Amount__c', type : 'currency'}
];

export default class InsuranceManagementSystem extends LightningElement {
    //related to detault page
    insuranceImage = INSURANCE_IMAGE;
    defaultBody = true;
    AdAgPhPy = false;
    adminDefaultPage = false;
    agentDefaultPage = false;
    poicyHolderDefaultPage = false;
    paymentsDefaultPage = false;
    registrationFrom = false;
    registrationFromTwo = false;
    selectedValue;
    ifTrue;

    //related to agent
    @track agentInputValue;
    @track agentRecord;
    agentHelpText = false;
    agentErrorText = false;
    agentRelatedRecords;
    policyHolderColumns = COLUMNSS;
    loginPage = true;

    //related to policy holder
    @track phinputValue;
    @track insuranceRecords=undefined;
    showDataTable=false;
    helpText = false;
    phErrorText = false;
    columns = COLUMNS;
    showLoadingSpinner = false;
    //related to create policy holder record
    pName;
    pGender;
    pDob;
    pPhone;
    pEmail;
    pOccupation;
    pIncome;
    pAddress;

    //related to payments
    successMessage=false;

    //related to loginpage
    userName;
    password;
    wrongDetails = false;

    handleEmailChange(event){
        this.userName = event.target.value;
    }
    handlePasswordChange(event){
        this.password = event.target.value;
    }
    handleOnlogin(){
        this.wrongDetails = false;
        checkAdminData({userName : this.userName, password : this.password}).then(result =>{
            const response = result;
            if(response.includes('Correct')){
                this.showLoadingSpinner = true;
                setTimeout(() => {
                    this.loginPage = false;
                    this.showLoadingSpinner = false;
                }, 2000);              
            }else if(response.includes('Wrong')){
                this.template.querySelectorAll('lightning-input').forEach(element => {        
                    element.value = null;    
                });
                this.wrongDetails = true;
                this.userName = '';
                this.password = '';
            }
        }).catch();
    }
    get enableLogin(){
        return this.userName && this.password;
    }
    handleOnLogOut(){
        this.loginPage = true;
    }

    homeTabOnClick(){
        this.defaultBody = true;
        this.registrationFrom = false;
        this.AdAgPhPy = false;
        this.adminDefaultPage = false;
        this.agentDefaultPage = false;
        this.poicyHolderDefaultPage = false;
        this.paymentsDefaultPage = false;
        this.agentRecord = false;
        this.agentHelpText = false;
        this.agentErrorText = false;
        this.helpText = false;
        this.phErrorText = false;
        this.showDataTable = false;
    }
    registerOnClick(){
        this.defaultBody = false;
        this.registrationFrom = true;
    }
    handleOnChange(event){
        const eventName = event.target.name;
        const eventValue = event.target.value;
        if(eventName === 'name'){
            this.pName = eventValue;
        }else if(eventName === 'gender'){
            this.pGender = eventValue;
        }else if(eventName === 'dob'){
            this.pDob = eventValue;
        }else if(eventName === 'phone'){
            this.pPhone = eventValue;
        }else if(eventName === 'email'){
            this.pEmail = eventValue;
        }else if(eventName === 'occupation'){
            this.pOccupation = eventValue;
        }else if(eventName === 'income'){
            this.pIncome = eventValue;
        }else if(eventName === 'address'){
            this.pAddress = eventValue;
        }
    }
    handleOnNext(){
        this.showLoadingSpinner = true;
        insertPHRecord({name : this.pName, gender : this.pGender, dob : this.pDob, phone : this.pPhone, email : this.pEmail, occupation : this.pOccupation, income : this.pIncome, address : this.pAddress})
        .then(result =>{
            const response = result;
            if(response.includes('success')){
                const toastEvent = new ShowToastEvent({
                    title: 'Successfully',
                    message: 'Record was inserted successfully.',
                    variant: 'success',
                    mode: 'dismissable'
                });
                this.dispatchEvent(toastEvent);
            }else{
                const toastEvent = new ShowToastEvent({
                    title: 'Inserted Failed',
                    message: response,
                    variant: 'error',
                    mode: 'dismissable'
                });
                this.dispatchEvent(toastEvent);
            }
            this.showLoadingSpinner = false;
        })
        .catch(error=>{
            console.log('errord occured '+error);
            const toastEvent = new ShowToastEvent({
                title: 'Inserted Failed',
                message: 'Record insertion is failed',
                variant: 'error',
                mode: 'dismissable'
            });
            this.dispatchEvent(toastEvent);
            this.showLoadingSpinner = false;
        });
    }
    get options() {
        return [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
        ];
    }
    registerCancel(){
        this.defaultBody = true;
        this.registrationFrom = false;
    }
    handleOnSecondNext(){
        
    }
    handleOnPrevious(){
        this.registrationFrom = true;
        this.registrationFromTwo = false;
    }
    get insuranceOptions() {
        return [
            { label: 'Motor Insurance', value: 'mInsurance' },
            { label: 'Life Insurance', value: 'lInsurance' },
        ];
    }
    handleSelectInsuranceOnChange(event){
        this.selectedValue = event.detail.value;
        if(this.selectedValue === 'mInsurance'){
            this.ifTrue = true;
        }
        else if(this.selectedValue === 'lInsurance'){
            this.ifTrue = false;
        }
    }

    adminTabOnClick(){
        this.AdAgPhPy = true;
        this.defaultBody = false;
        this.registrationFrom = false;
        this.adminDefaultPage = true;
        this.agentDefaultPage = false;
        this.poicyHolderDefaultPage = false;
        this.paymentsDefaultPage = false;
        this.agentRecord = false;
        this.agentHelpText = false;
        this.agentErrorText = false;
        this.helpText = false;
        this.phErrorText = false;
        this.showDataTable = false;
    }

    agentTabOnClick(){
        this.defaultBody = false;
        this.registrationFrom = false;
        this.AdAgPhPy = true;
        this.adminDefaultPage = false;
        this.agentDefaultPage = true;
        this.poicyHolderDefaultPage = false;
        this.paymentsDefaultPage = false;
        this.agentRecord = false;
        this.agentHelpText = false;
        this.agentErrorText = false;
        this.helpText = false;
        this.phErrorText = false;
        this.showDataTable = false;
    }
    agentIdOnchange(event){
        this.agentInputValue = event.target.value;
    }
    agentSubmitOnClick(){
        if(this.agentInputValue){
            getAgentrecord({agentId: this.agentInputValue}).then(result =>{
                if(result.length === 0){
                    this.agentRecord = undefined;
                    this.agentHelpText = true;
                    this.agentErrorText = false;
                }
                else{
                    this.agentHelpText = false;
                    this.agentRecord = result;
                    this.agentErrorText = false;
                }
            }).catch(error=>{
                console.log('Agent record error occured '+error);
            });
        }
        else{
            this.agentErrorText = true;
            this.agentHelpText = false;
            this.agentRecord = undefined;
        }
        getAgentRelatedPHRecords({agentId : this.agentInputValue}).then(result =>{
            if(result.length === 0){
                this.agentRelatedRecords=false;
            }
            else{
                this.agentRelatedRecords=result;
                this.agentHelpText=false;
            }
        }).catch(error =>{
            console.log('agent related policy holder records fetching is failed. '+error);
        });
    }

    policyHolderTabOnClick(){
        this.defaultBody = false;
        this.registrationFrom = false;
        this.AdAgPhPy = true;
        this.adminDefaultPage = false;
        this.agentDefaultPage = false;
        this.poicyHolderDefaultPage = true;
        this.paymentsDefaultPage = false;
        this.agentRecord = false;
        this.agentHelpText = false;
        this.agentErrorText = false;
        this.helpText = false;
        this.phErrorText = false;
        this.showDataTable = false;
    }
    policyHolderIdOnchange(event){
        this.phinputValue = event.target.value;
    }
    PolicyHoldersubmitOnClick(){
        if(this.phinputValue){
            getRelaedPHRecords({policyHolderId : this.phinputValue}).then(result =>{
                let wraperRecords = result;
                this.insuranceRecords=Object.values(wraperRecords);
                if(this.insuranceRecords.length ===0){
                    this.showDataTable=false;
                    this.helpText=true;
                    this.phErrorText = false;
                }else{
                    this.showDataTable=true;
                    this.helpText=false;
                    this.phErrorText = false;                     
                }               
            })
            .catch(error=>{
                console.log('error occured '+error);
            });
        }else{
            this.showDataTable=false;
            this.helpText=false;
            this.phErrorText = true; 
        }
    }

    paymentsTabOnClick(){
        this.defaultBody = false;
        this.registrationFrom = false;
        this.AdAgPhPy = true;
        this.adminDefaultPage = false;
        this.agentDefaultPage = false;
        this.poicyHolderDefaultPage = false;
        this.paymentsDefaultPage = true;
        this.successMessage = false;
        this.PaymentRecordEditForm = true;
        this.agentRecord = false;
        this.agentHelpText = false;
        this.agentErrorText = false;
        this.helpText = false;
        this.phErrorText = false;
        this.showDataTable = false;
    }
    PaymentSubmitOnclick(event){
        event.preventDefault();
        let fields = event.detail.fields;
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }
    handleSuccess(event){
        const toastEvent = new ShowToastEvent({
            title: 'Successfully',
            message: 'Payment Successfully Completed.',
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(toastEvent);
        this.PaymentRecordEditForm = false;
        this.successMessage = true;
    }
    paymentCancelOnClick(){
        this.template.querySelectorAll('lightning-input-field').forEach(element => {        
              element.value = null;    
          });
    }
}