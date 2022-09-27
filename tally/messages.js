const create_export_request = (request) => {
  const request_dec = {
    REQUESTDESC: request
  }

  const body = {
    EXPORTDATA: request_dec
  }

  const header = {
    TALLYREQUEST: "Export Data"
  }

  const envelope = {
    'HEADER': header,
    'BODY': body
  }

  return {'ENVELOPE': envelope}
}

const get_accounts_list = () => {
  const request = {
    REPORTNAME: "List of Accounts",
    STATICVARIABLES: {
      SVEXPORTFORMAT: "$$SysName:XML",
      ACCOUNTTYPE: "All Inventory Masters"
    }
  }

  return create_export_request(request)
}

module.exports = {
  get_accounts_request: get_accounts_list
}