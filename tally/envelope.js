const get_accounts_request = () => {
  const static_variables = {
    SVEXPORTFORMAT: "$$SysName:XML",
    ACCOUNTTYPE: "All Inventory Masters"
  }

  const request_descriptor = {
    REPORTNAME: "List of Accounts",
    STATICVARIABLES: static_variables
  }

  const export_data = {
    REQUESTDESC: request_descriptor
  }

  const body = {
    EXPORTDATA: export_data
  }

  const header = {
    'TALLYREQUEST': "Export Data"
  }

  const envelope = {
    'HEADER': header,
    'BODY': body
  }

  return {'ENVELOPE': envelope}
}

module.exports = {
  get_accounts_request
}