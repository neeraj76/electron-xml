const create_export_request = (header, body) => {
  return {
    'ENVELOPE': {
      'HEADER': header,
      'BODY': body
    }
  }
}

const get_accounts_list_request = () => {
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

const get_ledgers_list_request = () => {
  const header = {
    VERSION: 1,
    TALLYREQUEST: "Export",
    TYPE: "COLLECTION",
    ID: "List of Ledgers"
  }

  const body = {
    EXPORTDATA: {
      DESC: {
        STATICVARIABLES: {
          SVEXPORTFORMAT: "$$SysName:XML"
        }
      }
    }
  }
  
  return create_export_request(header, body)
}

module.exports = {
  get_accounts_list_request,
  get_ledgers_list_request
}