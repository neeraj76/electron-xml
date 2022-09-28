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

const get_profit_loss_request = () => {
  const header = get_export_data_header();

  const body = {
    EXPORTDATA: {
      REQUESTDESC: {
        STATICVARIABLES: {
          ...get_static_variables(),
          SVFROMDATE: "20220401",
          SVTODATE: "20230331"
        },
        REPORTNAME: "Profit and Loss"
      }
    }
  }

  return create_export_request(header, body)
}


const get_trial_balance_request = () => {
  const header = get_export_data_header();

  const body = {
    EXPORTDATA: {
      REQUESTDESC: {
        STATICVARIABLES: get_static_variables(),
        REPORTNAME: "Trial Balance"
      }
    }
  }
  return create_export_request(header, body)
}

const get_day_book_request = () => {
  const header = get_export_data_header();

  const body = {
    EXPORTDATA: {
      REQUESTDESC: {
        STATICVARIABLES: {
          ...get_static_variables(),
          SVFROMDATE: "20220401",
          SVTODATE: "20230331"
        },
        REPORTNAME: "Voucher Register"
      }
    }
  }

  return create_export_request(header, body)
}


module.exports = {
  get_accounts_list_request,
  get_ledgers_list_request,
  get_balance_sheet_request,
  get_profit_loss_request,
  get_trial_balance_request,
  get_day_book_request
}