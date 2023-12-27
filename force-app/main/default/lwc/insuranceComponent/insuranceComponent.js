import { LightningElement, track, wire } from 'lwc';
import fetchAllAgents from '@salesforce/apex/AgentHandler.fetchAllAgents';
import deleteAgentRecord from '@salesforce/apex/AgentHandler.deleteAgentRecord';
import fetchAllPolicyHolders from '@salesforce/apex/AgentHandler.fetchAllPolicyHolders';
import deletePHRecord from '@salesforce/apex/AgentHandler.deletePHRecord';
import fetchAllLifeInsurances from '@salesforce/apex/AgentHandler.fetchAllLifeInsurances';
import deleteLIRecord from '@salesforce/apex/AgentHandler.deleteLIRecord';
import fetchAllMotorInsurances from '@salesforce/apex/AgentHandler.fetchAllMotorInsurances';
import deleteMIRecord from '@salesforce/apex/AgentHandler.deleteMIRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
import {refreshApex} from '@salesforce/apex';

const actions = [
  { label: 'Edit', name: 'edit' },
  { label: 'Delete', name: 'delete' },
];
// this code sending to git for checking
const agentColumns = [
  {label : 'Name', fieldName : 'Name', type : 'text'},
  {label : 'Agent ID', fieldName : 'Agent_ID__c', type : 'text'},
  {label : 'DOB', fieldName : 'DOB__c', type : 'date'},
  {label : 'Gender', fieldName : 'Gender__c', type : 'text'},
  {label : 'Phone', fieldName : 'Phone__c', type : 'phone'},
  {label : 'Email', fieldName : 'Email__c', type : 'email'},
  {label : 'Reg Date', fieldName : 'Registration_Date__c', type : 'date'},
  {
    label: 'Action',
    type: 'action',
    typeAttributes: { rowActions: actions },
  },
];

const phColumns = [
  {label : 'Name', fieldName : 'Name', type : 'text'},
  {label : 'Agent ID', fieldName : 'Agent_Name__c', type : 'text'},
  {label : 'DOB', fieldName : 'Date_Of_Birth__c', type : 'date'},
  {label : 'Phone', fieldName : 'Phone__c', type : 'phone'},
  {label : 'Email', fieldName : 'Email__c', type : 'email'},
  {label : 'Occupation', fieldName : 'Occupation__c', type : 'date'},
  {label : 'Income', fieldName : 'Income__c', type : 'date'},
  {
    label: 'Action',
    type: 'action',
    typeAttributes: { rowActions: actions },
  },
];

const miColumns = [
  {label : 'Policy ID', fieldName : 'Name', type : 'text'},
  {label : 'Type of vehicle', fieldName : 'Motor_Type__c', type : 'text'},
  {label : 'Manufactured Year', fieldName : 'Manufactured_Year__c', type : 'number'},
  {label : 'Premium Type', fieldName : 'Premium_Type__c', type : 'text'},
  {label : 'Premium Amount', fieldName : 'Premium_Amount__c', type : 'currency'},
  {label : 'No. of terms', fieldName : 'No_of_Terms__c', type : 'number'},
  {
    label: 'Action',
    type: 'action',
    typeAttributes: { rowActions: actions },
  },
];

const liColumns = [
  {label : 'Policy ID', fieldName : 'Name', type : 'text'},
  {label : 'Premium Type', fieldName : 'Premium_Type__c', type : 'text'},
  {label : 'Premium Amount', fieldName : 'Premium_Amount__c', type : 'currency'},
  {label : 'No. of terms', fieldName : 'No_of_Terms__c', type : 'number'},
  {label : 'Premium start date', fieldName : 'Premium_Start_Date__c', type : 'date'},
  {label : 'Premium end date', fieldName : 'Premium_End_Date__c', type : 'date'},
  {
    label: 'Action',
    type: 'action',
    typeAttributes: { rowActions: actions },
  },
];

export default class InsuranceComponent extends LightningElement {
  //related to log out
  handleOnselect(event) {
    const selectedItemValue = event.detail.value;
    if(selectedItemValue === 'logOut'){
      this.dispatchEvent(new CustomEvent('mylogout'));
    }
}

  //related to adimin home page
    homePage=true;
    agentPage=false;
    policyHolderPage=false;
    lifeInsuPage=false;
    motarInsuPage=false;

    //related to agent
    addAgent=false;
    agentShowModal=false;
    listOfAgents=false;
    @track agentData;
    columns = agentColumns;
    @track showLoadingSpinner = false;
    refreshAgentTable;
    agentRecordId;

    //related to policy holder
    policyHolderShowModal=false;
    listOfPolicyHolders = false;
    @track policyHolderData;
    policyHoldercolumns = phColumns;
    refreshPHTable;
    policyHolderRecordId;

    //related to life insurance
    lifeInsuranceShowModal = false;
    listOfLifeInsurances = false;
    @track lifeInsuranceData;
    lifeInsurancecolumns = liColumns;
    refreshLITable;
    lifeInsuranceRecordId;

    //related to motor insurance
    motorInsuranceShowModal=false;
    listOfMotorInsurance = false;
    @track motorInsuranceData;
    motorInsuranceColumns = miColumns;
    refreshMITable;
    motorInsuranceRecordId;

    handleOnClick(event){
      const elementName = event.target.name;
      if(elementName === 'agent')
      {
        this.homePage=false;
        this.agentPage=true;
        this.policyHolderPage=false;
        this.lifeInsuPage=false;
        this.motarInsuPage=false;
      }
      else if(elementName === 'policy')
      {
        this.homePage=false;
        this.agentPage=false;
        this.policyHolderPage=true;
        this.lifeInsuPage=false;
        this.motarInsuPage=false;
      }
      else if(elementName === 'life')
      {
        this.homePage=false;
        this.agentPage=false;
        this.policyHolderPage=false;
        this.lifeInsuPage=true;
        this.motarInsuPage=false;
      }
      else if(elementName === 'motar')
      {
        this.homePage=false;
        this.agentPage=false;
        this.policyHolderPage=false;
        this.lifeInsuPage=false;
        this.motarInsuPage=true;
      }
    }
    firstBackOnClick(){
      this.homePage=true;
      this.agentPage=false;
      this.policyHolderPage=false;
      this.lifeInsuPage=false;
      this.motarInsuPage=false;
    }

    //related to agent
    @wire(fetchAllAgents)
    getLifeOfagents(agentResponse){
      this.refreshAgentTable = agentResponse;
      if(agentResponse.data){
        this.agentData=agentResponse.data; 
      }
      else if(agentResponse.error){
        this.agentData=undefined;
      }
    }
    addAgentOnClick(event)
    {
      this.agentRecordId = '';
      this.agentShowModal = true;
    }
    hideModalBox() {
      this.template.querySelectorAll('lightning-input-field').forEach(element => {        
        element.value = null;    
      });
      this.agentShowModal = false;
  }
  agentSaveRecordOnClick(event)
  {
    event.preventDefault();
    let fields = event.detail.fields;
    this.template.querySelector('lightning-record-edit-form').submit(fields);
  }
  agentSaveOnsuccesss(){
    this.showToastMessage('Successfully', 'Operation Successfully completed.', 'success');
    this.hideModalBox();
    return refreshApex(this.refreshAgentTable);
  }
  viewAgentOnClick()
  {
    this.agentPage=false;
    this.listOfAgents=true; 
  }
  hideListOfAgents(evnet)
  {
    this.listOfAgents=false;
    this.agentPage=true;
  }
  AgentRowAction(event){
    const action = event.detail.action;
            const row = event.detail.row;
            switch (action.name) {
                case 'delete':
                  this.deleteAgent(row.Id);
                    break;
                case 'edit':
                  this.editAgentRecord(row.Id);
                    break;
            }
  }
  deleteAgent(agentRecordId){
    this.showLoadingSpinner = true;
    deleteAgentRecord({agentId : agentRecordId}).then(result =>{
      this.showLoadingSpinner = false;
      this.showToastMessage('Successfully', 'Record Deleted Successfully', 'success');
      return refreshApex(this.refreshAgentTable);
    }).catch(error =>{
      this.showToastMessage('Error!!', 'Record Deletion failed', 'error');
    });
  }
  editAgentRecord(agenttRecordId){
    this.agentRecordId = agenttRecordId;
    this.agentShowModal = true;
  }

  //related to policy holder
  @wire(fetchAllPolicyHolders)
  getLifeOfPH(response){
    this.refreshPHTable = response;
    if(response.data){
      this.policyHolderData=response.data; 
    }
    else if(response.error){
      this.policyHolderData=undefined;
    }
  }
  addPHOnClick(){
    this.policyHolderRecordId = '';
    this.policyHolderShowModal = true;
  }
  PhHideModalBox(){
    this.template.querySelectorAll('lightning-input-field').forEach(element => {        
      element.value = null;    
    });
    this.policyHolderShowModal = false;
  }
  phSaveOnsuccesss(){
    this.showToastMessage('Successfully', 'Operation Successfully completed.', 'success');
    this.PhHideModalBox();
    return refreshApex(this.refreshPHTable);
  }
  phSaveRecordOnClick(event){
    event.preventDefault();
    let fields = event.detail.fields;
    this.template.querySelector('lightning-record-edit-form').submit(fields);
  }
  viewPHOnClick(){
    /*this.showLoadingSpinner = true;
    fetchAllPolicyHolders().then(result =>{
      this.showLoadingSpinner = false;
      this.policyHolderData=result;
    })
    .catch(error=>{
      console.log('errror occured '+error);
    });*/
    this.policyHolderPage=false;
    this.listOfPolicyHolders = true;
  }
  policyHolderRowAction(event){
    const action = event.detail.action;
    const row = event.detail.row;
    switch (action.name) {
      case 'delete':
        this.deletePolicyHolderRecord(row.Id);
          break;
      case 'edit':
        this.editPHRecord(row.Id);
          break;
    }
  }
  deletePolicyHolderRecord(phRecordId){
    this.showLoadingSpinner = true;
    deletePHRecord({policyHolderId : phRecordId}).then(result =>{
      this.showLoadingSpinner = false;
      this.showToastMessage('Successfully', 'Record Deleted Successfully', 'success');
      return refreshApex(this.refreshPHTable);
    }).catch(error =>{
      this.showToastMessage('Error!!', 'Record Deletion failed', 'error');
    });
  }
  editPHRecord(phRecordId){
    this.policyHolderRecordId = phRecordId;
    this.policyHolderShowModal = true;

  }
  hideListOfPolicyHolders(){
    this.listOfPolicyHolders=false;
    this.policyHolderPage=true;
  }

  //related to life insurance
  @wire(fetchAllLifeInsurances)
  getListOfLi(liResponse){
    this.refreshLITable = liResponse;
    if(liResponse.data){
      this.lifeInsuranceData=liResponse.data; 
    }
    else if(liResponse.error){
      this.lifeInsuranceData=undefined;
    }
  }
  addLIOnClick(){
    this.lifeInsuranceRecordId = '';
    this.lifeInsuranceShowModal = true;
  }
  liHideModalBox(){
    this.template.querySelectorAll('lightning-input-field').forEach(element => {        
      element.value = null;    
    });
    this.lifeInsuranceShowModal = false;
  }
  liSaveOnsuccesss(){
    this.showToastMessage('Successfully', 'Operation Successfully completed.', 'success');
    this.liHideModalBox();
    return refreshApex(this.refreshLITable);
  }
  liSaveRecordOnClick(event){
    event.preventDefault();
    let fields = event.detail.fields;
    this.template.querySelector('lightning-record-edit-form').submit(fields);
  }
  viewLiOnClick(){
    this.lifeInsuPage=false;
    this.listOfLifeInsurances = true;
  }
  lifeInsuranceRowAction(event){
    const action = event.detail.action;
    const row = event.detail.row;
    switch (action.name) {
      case 'delete':
        this.deleteLifeInsuranceRecord(row.Id);
          break;
      case 'edit':
        this.editLIRecord(row.Id);
          break;
    }
  }
  deleteLifeInsuranceRecord(liRecordId){
    this.showLoadingSpinner = true;
    deleteLIRecord({lifeInsuranceId : liRecordId}).then(result =>{
      this.showLoadingSpinner = false;
      this.showToastMessage('Successfully', 'Record Deleted Successfully', 'success');
      return refreshApex(this.refreshLITable);
    }).catch(error =>{
      this.showToastMessage('Error!!', 'Record Deletion failed', 'error');
    });
  }
  editLIRecord(liRecordId){
    this.lifeInsuranceRecordId = liRecordId;
    this.lifeInsuranceShowModal = true;
  }
  hideListOfLifeInsurances(){
    this.listOfLifeInsurances=false;
    this.lifeInsuPage=true;
  }

  //related to motor insurance
  @wire(fetchAllMotorInsurances)
  getListOfMi(miResponse){
    this.refreshMITable = miResponse;
    if(miResponse.data){
      this.motorInsuranceData=miResponse.data; 
    }
    else if(miResponse.error){
      this.motorInsuranceData=undefined;
    }
  }
  addMIOnClick(){
    this.motorInsuranceRecordId = '';
    this.motorInsuranceShowModal = true;
  }
  miHideModalBox(){
    this.template.querySelectorAll('lightning-input-field').forEach(element => {        
      element.value = null;    
    });
    this.motorInsuranceShowModal = false;
  }
  miSaveOnsuccesss(){
    this.showToastMessage('Successfully', 'Operation Successfully completed.', 'success');
    this.miHideModalBox();
    return refreshApex(this.refreshMITable);
  }
  miSaveRecordOnClick(event){
    event.preventDefault();
    let fields = event.detail.fields;
    this.template.querySelector('lightning-record-edit-form').submit(fields);
  }
  viewMIOnClick(){
    this.motarInsuPage=false;
    this.listOfMotorInsurance = true;
  }
  motorInsuranceRowAction(event){
    const action = event.detail.action;
    const row = event.detail.row;
    switch (action.name) {
      case 'delete':
        this.deleteMotorInsuranceRecord(row.Id);
          break;
      case 'edit':
        this.editMIRecord(row.Id);
          break;
    }
  }
  deleteMotorInsuranceRecord(miRecordId){
    this.showLoadingSpinner = true;
    deleteMIRecord({motorInsuranceId : miRecordId}).then(result =>{
      this.showLoadingSpinner = false;
      this.showToastMessage('Successfully', 'Record Deleted Successfully', 'success');
      return refreshApex(this.refreshMITable);
    }).catch(error =>{
      this.showToastMessage('Error!!', 'Record Deletion failed', 'error');
    });
  }
  editMIRecord(miRecordId){
    this.motorInsuranceRecordId = miRecordId;
    this.motorInsuranceShowModal = true;
  }
  hideListOfMotorInsurances(){
    this.listOfMotorInsurance=false;
    this.motarInsuPage=true;
  }


  showToastMessage(title, message, variant)
  {
    const evt = new ShowToastEvent({
        title: title,
        message: message,
        variant: variant,
    });
    this.dispatchEvent(evt);
  }
}