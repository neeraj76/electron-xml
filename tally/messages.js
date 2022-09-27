const create_export_request = (header, body) => {
  return {
    'ENVELOPE': {
      'HEADER': header,
      'BODY': body
    }
  }
}

const get_accounts_list = () => {
  const header = {
    TALLYREQUEST: "Export Data"
  }
  
  const body = {
    EXPORTDATA: {
      REQUESTDESC: {
        REPORTNAME: "List of Accounts",
        STATICVARIABLES: {
          SVEXPORTFORMAT: "$$SysName:XML",
          ACCOUNTTYPE: "All Inventory Masters"
        }
      }
    }
  }


  return create_export_request(header, body)
}

const get_trial_balance = () => {

}
module.exports = {
  get_accounts_request: get_accounts_list
}