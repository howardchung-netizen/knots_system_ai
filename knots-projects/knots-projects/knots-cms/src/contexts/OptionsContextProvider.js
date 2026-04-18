import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { useQuery, useSubscription } from "@apollo/client";
import { OPTIONS_QUERY } from "../apollo/queries";
import BackdropLoading from "../components/BackdropLoading";
import { ON_CLIENT_CHANGE, ON_CLIENT_CONTACT_CHANGE } from "../apollo/subscriptions";

export const OptionsContext = createContext({});

const OptionsContextReducer = (state, action) => {
  switch (action.type) {
    case 'INIT':
      return { ...state,  ...action.payload  };
  }
}

export const OptionsContextProvider = ({ children }) => {
  const { data, loading, error, refetch } = useQuery(OPTIONS_QUERY)
  const [context, dispatch] = useReducer(OptionsContextReducer, useContext(OptionsContext));

  const clientSubscription = useSubscription(ON_CLIENT_CHANGE, {
    onSubscriptionData: ({ subscriptionData: data }) => {
      refetch()
    }
  });

  const clientContactSubscription = useSubscription(ON_CLIENT_CONTACT_CHANGE, {
    onSubscriptionData: ({subscriptionData: data}) =>{
      refetch()
    }
  });
  
  useEffect(() => {
    dispatch({ type: "INIT", payload: data });
  }, [data])

  const projectStautsOptions = useMemo(() => {
    let options = []
    if (data?.projectStatuss?.edges) options = data.projectStatuss.edges.map(({ node }) => ({ label: node.nameCht, value: node.id }))
    return options
  }, [data])

  const projectStautsIds = useMemo(() => {
    let options = []
    if (data?.projectStatuss?.edges) options = data.projectStatuss.edges.map(({ node }) => node.id)
    return options
  }, [data])

  const quotationStauts = useMemo(() => {
    let options = []
    if (data?.quotationStatuses?.edges) options = data.quotationStatuses.edges.map(({ node }) => (node))
    return options
  }, [data])

  const quotationStautsOptions = useMemo(() => {
    let options = []
    if (data?.quotationStatuses?.edges) options = data.quotationStatuses.edges.map(({ node }) => ({ label: node.nameCht, value: node.id }))
    return options
  }, [data])

  const quotationStautsIds = useMemo(() => {
    let options = []
    if (data?.quotationStatuses?.edges) options = data.quotationStatuses.edges.map(({ node }) => node.id)
    return options
  }, [data])

  const projectSpotlightOptions = useMemo(() => {
    let options = []
    if (data?.projectSpotlight?.edges) options = data.projectSpotlight.edges.map(({ node }) => ({ label: node.hex, value: node.id }))
    return options
  }, [data])

  const projectSpotlightIds = useMemo(() => {
    let options = []
    if (data?.projectSpotlight?.edges) options = data.projectSpotlight.edges.map(({ node }) => node.id)
    return options
  }, [data])

  const projectTypeOptions = useMemo(() => {
    let options = []
    if (data?.projectTypes?.edges) options = data.projectTypes.edges.map(({ node }) => ({ label: node.nameCht, value: node.id }))
    return options
  }, [data])

  const projectTypeIds = useMemo(() => {
    let options = []
    if (data?.projectTypes?.edges) options = data.projectTypes.edges.map(({ node }) => node.id)
    return options
  }, [data])

  const clientOptions = useMemo(() => {
    let options = []
    if (data?.clients?.edges) options = data.clients.edges.map(({ node }) => {
      return {
        ...node,
        label: node.nameCht ?? node.nameEn,
        value: node.id
      }
    })
    return options
  }, [data])

  const clientContactOptions = useMemo(() => {
    let options = []
    if (data?.clientContacts?.edges) options = data.clientContacts.edges.map(({ node }) => {
      return {
        ...node,
        label: node.nameCht ?? node.nameEn,
        value: node.id
      }
    })
    return options
  }, [data])

  const projectHashtagOptions = useMemo(() => {
    let options = []
    if (data?.projectHashtag?.edges) options = data.projectHashtag.edges.map(({ node }) => {
      return {
        ...node,
        label: node.nameCht ?? node.nameEn,
        value: node.id
      }
    })
    return options
  }, [data])

  const measurementOptions = useMemo(() => {
    let options = []
    if (data?.measurements?.edges) options = data.measurements.edges.map(({ node }) => {
      return {
        ...node,
        label: node.nameCht ?? node.nameEn,
        value: node.id
      }
    })
    return options
  }, [data])

  const bookKeepingCompanyOptions = useMemo(() => {
    let options = []
    if (data?.bookKeepingCompanies?.edges) options = data.bookKeepingCompanies.edges.map(({ node }) => {
      return {
        ...node,
        label: node.companyName,
        value: node.id
      }
    })
    return options
  }, [data])

  const bookKeepingAccountOptions = useMemo(() => {
    let options = []
    if (data?.bookKeepingAccounts?.edges) options = data.bookKeepingAccounts.edges.map(({ node }) => {
      return {
        ...node,
        label: node.name,
        value: node.id
      }
    })
    return options
  }, [data])

  const claimBookKeepingAccountOptions = useMemo(() => {
    let options = []
    if (data?.bookKeepingAccounts?.edges) options = data.bookKeepingAccounts.edges.map(({ node }) => {
      return {
        ...node,
        label: node.name,
        value: node.id
      }
    }).filter(e => e.isClaim)
    return options
  }, [data])

  const bookKeepingAccountTypeOptions = useMemo(() => {
    let options = []
    if (data?.bookKeepingAccountTypes?.edges) options = data.bookKeepingAccountTypes.edges.map(({ node }) => {
      return {
        ...node,
        label: node.name,
        value: node.id
      }
    })
    return options
  }, [data])

  console.log(data)

  return (
    <OptionsContext.Provider value={[context, dispatch, {
      projectStautsOptions,
      projectStautsIds,
      quotationStauts,
      quotationStautsOptions,
      quotationStautsIds,
      projectSpotlightOptions,
      projectSpotlightIds,
      projectTypeOptions,
      projectTypeIds,
      clientOptions,
      clientContactOptions,
      projectHashtagOptions,
      measurementOptions,
      bookKeepingCompanyOptions,
      bookKeepingAccountOptions,
      claimBookKeepingAccountOptions,
      bookKeepingAccountTypeOptions
    }]}>
      {loading && <BackdropLoading />}
      {data ? children : null}
    </OptionsContext.Provider>
  );
};



