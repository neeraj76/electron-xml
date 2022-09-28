const create_export_request = (header, body) => {
  return {
    'ENVELOPE': {
      'HEADER': header,
      'BODY': body
    }
  }
}

const get_export_data_header = () => {
  return {
    TALLYREQUEST: "Export Data"
  }
}

const get_version_1_header = () => {
  return {
    VERSION: 1,
    TALLYREQUEST: "Export",
  }
}

const get_static_variables = () => {
  return {
    SVEXPORTFORMAT: "$$SysName:XML"
  }
}

const get_accounts_list_request = () => {
  const header = get_export_data_header();

  const body = {
    EXPORTDATA: {
      REQUESTDESC: {
        REPORTNAME: "List of Accounts",
        STATICVARIABLES: {
          ...get_static_variables(),
          ACCOUNTTYPE: "All Inventory Masters"
        }
      }
    }
  }


  return create_export_request(header, body)
}

const get_ledgers_list_request = () => {
  const header = {
    ...get_version_1_header(),
    TYPE: "COLLECTION",
    ID: "List of Ledgers"
  }

  const body = {
    EXPORTDATA: {
      DESC: {
        STATICVARIABLES: get_static_variables()
      }
    }
  }

  return create_export_request(header, body)
}

const get_balance_sheet_request = () => {
  const header = get_export_data_header();

  const body = {
    EXPORTDATA: {
      REQUESTDESC: {
        STATICVARIABLES: get_static_variables(),
        REPORTNAME: "Balance Sheet"
      }
    }
  }

  return create_export_request(header, body)
}

module.exports = {
  get_accounts_list_request,
  get_ledgers_list_request,
  get_balance_sheet_request
}