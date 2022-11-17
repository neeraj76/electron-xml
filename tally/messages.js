const {dateTallyFormat} = require("./tally_date");

const flagDebugRequests = false;


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

const get_version_1_export_header = () => {
  return {
    VERSION: 1,
    TALLYREQUEST: "Export",
  }
}

const get_version_1_import_header = () => {
  return {
    VERSION: 1,
    TALLYREQUEST: "Import",
  }
}


const get_static_variables = (parameters) => {
  let static_vars = {
    SVEXPORTFORMAT: "$$SysName:XML"
  };

  if (parameters !== undefined) {
    console.log(`get_static_variables: parameters=${JSON.stringify(parameters)}`);
    if (Object.keys(parameters).includes('company')) {
      static_vars = {...static_vars, SVCURRENTCOMPANY: parameters.company};
    }
    console.log(`get_static_variables: parameters=${JSON.stringify(static_vars)}`);
  } else {
    console.log(`We do not have paramaters`)
  }

  return static_vars;
}

const get_companies_request = () => {
  const header = {
    ...get_version_1_export_header(),
    TYPE: "COLLECTION",
    ID: "List of Companies"
  }

  const body = {
    DESC: {
      STATICVARIABLES: {
        SVIsSimpleCompany: "No"
      },
      TDL: {
        TDLMESSAGE: {
          COLLECTION: {
            '$': {
              ISMODIFY: "No",
              ISFIXED: "No",
              ISINITIALIZE: "Yes",
              ISOPTION: "No",
              ISINTERNAL: "No",
              NAME: "List of Companies"
            },
            TYPE: "Company",
            NATIVEMETHOD: ["NAME"]
          }
        }
      }
    }
  }

  return create_export_request(header, body)
}

const get_current_company_request = () => {
  const header = {
    ...get_version_1_export_header(),
    TYPE: "COLLECTION",
    ID: "CompanyInfo"
  }

  const body = {
    DESC: {
      STATICVARIABLES: {},
      TDL: {
        TDLMESSAGE: {
          // Object definition to be used in collection
          OBJECT: {
            // headerInfo
            '$': {
              NAME: "CurrentCompany"
            },
            // fields to be fetched
            LOCALFORMULA: [
              {
                "_": "CurrentCompany:##SVCURRENTCOMPANY"
              },
            ]
          },
          // Collection Pointer
          COLLECTION: {
            '$': {
              NAME: "CompanyInfo",
            },
            // Object Pointer
            OBJECTS: "CurrentCompany"
          }
        }
      }
    }
  }

  return create_export_request(header, body)
}


const get_license_info_request = () => {
  const header = {
    ...get_version_1_export_header(),
    TYPE: "COLLECTION",
    ID: "LicenseInfo"
  }

  const body = {
    DESC: {
      STATICVARIABLES: {},
      TDL: {
        TDLMESSAGE: {
          // Object definition to be used in collection
          OBJECT: {
            // headerInfo
            '$': {
              NAME: "LicenseInfo"
            },
            // fields to be fetched
            LOCALFORMULA: [
              {
                "_": "ApplicationPath:$$SysInfo:ApplicationPath"
              },
              {
                "_": "DataPath:##SVCurrentPath"
              },
              {
                "_": "SerialNumber: $$LicenseInfo:SerialNumber"
              },
              {
                "_": "IsEducationalMode:  $$LicenseInfo:IsEducationalMode"
              },
            ]
          },
          // Collection Pointer
          COLLECTION: {
            '$': {
              NAME: "LicenseInfo",
            },
            // Object Pointer
            OBJECTS: "LicenseInfo"
          }
        }
      }
    }
  }

  return create_export_request(header, body)
}

const get_accounts_list_request = () => {
  const header = get_export_data_header();

  const body = {
    EXPORTDATA: {
      REQUESTDESC: {
        REPORTNAME: "List of Accounts",
        STATICVARIABLES: {
          ...get_static_variables()
        }
      }
    }
  }


  return create_export_request(header, body)
}

const get_accounts_inventory_masters_list_request = () => {
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

const get_ledgers_names_only_list_request = () => {
  const header = {
    ...get_version_1_export_header(),
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

const get_ledgers_list_request = (parameters) => {
  const header = {
    ...get_version_1_export_header(),
    TYPE: "COLLECTION",
    ID: "Ledgers"
  }

  const body = {
      DESC: {
        STATICVARIABLES: get_static_variables(parameters),
        TDL: {
          TDLMESSAGE: {
            COLLECTION: {
              '$': {
                ISMODIFY: "No",
                ISFIXED: "No",
                ISINITIALIZE: "No",
                ISOPTION: "No",
                ISINTERNAL: "No",
                NAME: "Ledgers"
              },
              TYPE: "Ledger",
              NATIVEMETHOD: ["NAME", "PARENT"]
            }
          }
        }
      }
  }

  return create_export_request(header, body)
}

const get_ledger_groups_list_request = () => {
  const header = {
    ...get_version_1_export_header(),
    TYPE: "COLLECTION",
    ID: "List of Groups"
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

// opening_amount should be negative for a positive opening balance
//
const create_ledger_request = (ledger_name, ledger_group_name, opening_amount) => {
  const header = {
    ...get_version_1_import_header(),
    TYPE: "Data",
    ID: "All Masters"
  }

  const body = {
    DESC: {
      STATICVARIABLES: {
        IMPORTDUPS: "@@DUPCOMBINE"
      }
    },
    DATA: {
      TALLYMESSAGE: {
        LEDGER: {
          '$': {
            NAME: ledger_name,
            Action: 'Create'
          },
          NAME: ledger_name,
          PARENT: ledger_group_name,
          OPENINGBALANCE: opening_amount
        }
      }
    }
  }

  return create_export_request(header, body)
}

const create_ledger_group_request = (ledger_group_name, parent_ledger_group_name) => {
  const header = {
    ...get_version_1_import_header(),
    TYPE: "Data",
    ID: "All Masters"
  }

  const body = {
    DESC: {
      STATICVARIABLES: {
        IMPORTDUPS: "@@DUPCOMBINE"
      }
    },
    DATA: {
      TALLYMESSAGE: {
        GROUP: {
          '$': {
            NAME: ledger_group_name,
            Action: 'Create'
          },
          NAME: ledger_group_name,
          PARENT: parent_ledger_group_name
        }
      }
    }
  }

  return create_export_request(header, body)
}



const create_voucher_request = (voucher_type, date, debit_ledger, credit_ledger, amount, narration) => {
  const header = {
    ...get_version_1_import_header(),
    TYPE: "Data",
    ID: "Vouchers"
  }

  const dateStr = dateTallyFormat(date);

  const voucher = {
    DATE: dateStr,
    NARRATION: narration,
    VOUCHERTYPENAME: voucher_type,
    VOUCHERNUMBER: 1
  };

  voucher['ALLLEDGERENTRIES.LIST'] = [
    {
      LEDGERNAME: debit_ledger,
      ISDEEMEDPOSITIVE: "Yes",
      AMOUNT: -amount
    },
    {
      LEDGERNAME: credit_ledger,
      ISDEEMEDPOSITIVE: "No",
      AMOUNT: amount
    }
  ]

  const body = {
    DESC: {},
    DATA: {
      TALLYMESSAGE: {
        VOUCHER: [voucher]
      }
    }
  }

  return create_export_request(header, body)

}


const create_vouchersplit_request = (voucher_type, date, narration, debit_entries, credit_entries) => {
  const header = {
    ...get_version_1_import_header(),
    TYPE: "Data",
    ID: "Vouchers"
  }

  const dateStr = dateTallyFormat(date);

  const voucher = {
    DATE: dateStr,
    NARRATION: narration,
    VOUCHERTYPENAME: voucher_type,
    VOUCHERNUMBER: 1
  };

  if (flagDebugRequests) {
    console.log(`debit_entries:${debit_entries}`);
    console.log(`credit_entries:${credit_entries}`);
  }

  voucher['ALLLEDGERENTRIES.LIST'] = []
  let debit_total = 0;
  debit_entries.forEach(dentry => {
    voucher['ALLLEDGERENTRIES.LIST'].push({
      LEDGERNAME: dentry.ledger_account,
      ISDEEMEDPOSITIVE: "Yes",
      AMOUNT: -dentry.amount
    });
    debit_total += dentry.amount;
  })

  let credit_total = 0;
  credit_entries.forEach(dentry => {
    voucher['ALLLEDGERENTRIES.LIST'].push({
      LEDGERNAME: dentry.ledger_account,
      ISDEEMEDPOSITIVE: "No",
      AMOUNT: dentry.amount
    });
    credit_total += dentry.amount;
  })

  const net_diff = credit_total - debit_total;
  if (net_diff > 0.00001) {
    console.error(`Error: The total debit=${debit_total} does not match total credit =${credit_total}`);
    return;
  }

  const body = {
    DESC: {},
    DATA: {
      TALLYMESSAGE: {
        VOUCHER: [voucher]
      }
    }
  }

  return create_export_request(header, body)
}

const create_unit_name_request = (unit_name) => {
  const header = {
    ...get_version_1_import_header(),
    TYPE: "Data",
    ID: "All Masters"
  }

  const body = {
    DESC: {
      STATICVARIABLES: {
        IMPORTDUPS: "@@DUPCOMBINE"
      }
    },
    DATA: {
      TALLYMESSAGE: {
        UNIT: {
          '$': {
            NAME: unit_name,
            Action: 'Create'
          },
          NAME: unit_name,
          ISSIMPLEUNIT: "Yes",
          FORPAYROLL: "No"
        }
      }
    }
  }

  return create_export_request(header, body)
}


const create_stock_group_request = (stock_group_name, parent_stock_group_name) => {
  const header = {
    ...get_version_1_import_header(),
    TYPE: "Data",
    ID: "All Masters"
  }

  const body = {
    DESC: {
      STATICVARIABLES: {
        IMPORTDUPS: "@@DUPCOMBINE"
      }
    },
    DATA: {
      TALLYMESSAGE: {
        STOCKGROUP: {
          '$': {
            NAME: stock_group_name,
            Action: 'Create'
          },
          NAME: stock_group_name,
          PARENT: parent_stock_group_name
        }
      }
    }
  }

  return create_export_request(header, body)
}

const create_stock_item_request = (stockitem_name, parent_stock_group_name, unit_name,
    open_position_type, open_position_quantity, open_position_amount) => {
  const header = {
    ...get_version_1_import_header(),
    TYPE: "Data",
    ID: "All Masters"
  }

  const stock_item = {
    '$': {
      NAME: stockitem_name,
      Action: 'Create'
    },
    NAME: stockitem_name,
    PARENT: parent_stock_group_name,
    BASEUNITS:unit_name,
    COSTINGMETHOD: "FIFO"
  }

  if (open_position_type != undefined) {
    if (open_position_type === 'BUY' || open_position_type === 'B') {
      open_position_amount *= -1;
    }
    stock_item.OPENINGBALANCE = `${open_position_quantity} ${unit_name}`;
    stock_item.OPENINGVALUE = -open_position_amount;
    stock_item.OPENINGRATE = `${-open_position_amount/open_position_quantity}/${unit_name}`;
  }

  const body = {
    DESC: {
      STATICVARIABLES: {
        IMPORTDUPS: "@@DUPCOMBINE"
      }
    },
    DATA: {
      TALLYMESSAGE: {
        STOCKITEM: stock_item
      }
    }
  }

  return create_export_request(header, body)
}

module.exports = {
  get_companies_request,
  get_current_company_request,
  get_license_info_request,
  get_accounts_list_request,
  get_ledgers_list_request,
  get_ledger_groups_list_request,
  get_balance_sheet_request,
  get_profit_loss_request,
  get_trial_balance_request,
  get_day_book_request,

  create_ledger_request,
  create_ledger_group_request,
  create_voucher_request,
  create_vouchersplit_request,
  create_unit_name_request,
  create_stock_group_request,
  create_stock_item_request
}