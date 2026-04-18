import moment from 'moment';

export const updateBookingChange = (prev, data, shopId, date) => {
  if (!data) return prev;

  const bookingChange = data.onBookingChange;
  const {mutation , node, updatedFields, previousValues} = bookingChange;
  const edgeType = "BookingEdge";
  const connection = "bookings";

  let edges = null, totalCount = prev?.[connection].totalCount;
  if (mutation === "CREATED"){
    edges = [...prev?.[connection]?.edges, { node, cursor:"", __typename: edgeType }];
    totalCount += 1;
  }
  else if (mutation === "UPDATED"){
    //remove record if updateFields contain "deleted",
    if (updatedFields.includes('deleted'))
    {
      edges = [...prev?.[connection]?.edges?.filter(x => x.node.id !== node.id)];
      totalCount -= 1;
    }
    else if (updatedFields.includes('shop') || updatedFields.includes('date')) {
      if (node.shop.id === shopId && node.date === date){
        if (previousValues.shop.id !== node.shop.id || previousValues.date !== node.date) {
          //Insert new record
          edges = [...prev?.[connection]?.edges, { node, cursor:"", __typename: edgeType }];
          totalCount += 1;
        }
        else if (previousValues.shop.id === node.shop.id || previousValues.date === node.date) {
          //Update current record
          edges = [...prev?.[connection]?.edges?.map(x => x.node.id === node.id ? {...x, node }: x)];
        }
        else {
          //Remove record which either shop or date is not match
          edges = [...prev?.[connection]?.edges?.filter(x => x.node.id !== node.id)];
          totalCount -= 1;
        }
      }
      else {
        //Remove record which either shop or date is not match
        edges = [...prev?.[connection]?.edges?.filter(x => x.node.id !== node.id)];
        totalCount -= 1;
      }
    }
    else {
      //Update current record
      edges = [...prev?.[connection]?.edges?.map(x => x.node.id === node.id ? {...x, node }: x)];
    }
  }

  return edges ? {
    [connection]: {
      __typename: prev?.[connection].__typename,
      edges,
      pageInfo: prev?.[connection].pageInfo,
      totalCount
    }
  } : prev;
}

export const updateMemberTodayBookingChange = (prev, data, date) => {
  if (!data) return prev;

  const bookingChange = data.onBookingChange;
  const {mutation , node, updatedFields, previousValues} = bookingChange;
  const edgeType = "BookingEdge";
  const connection = "bookings";

  let edges = null, totalCount = prev?.[connection].totalCount;
  if (mutation === "CREATED"){
    edges = [...prev?.[connection]?.edges, { node, cursor:"", __typename: edgeType }];
    totalCount += 1;
  }
  else if (mutation === "UPDATED"){
    //remove record if updateFields contain "deleted",
    if (updatedFields.includes('deleted'))
    {
      edges = [...prev?.[connection]?.edges?.filter(x => x.node.id !== node.id)];
      totalCount -= 1;
    }
    else if (updatedFields.includes('date')) {
      if (node.date === date){
        if (previousValues.date !== node.date) {
          //Insert new record
          edges = [...prev?.[connection]?.edges, { node, cursor:"", __typename: edgeType }];
          totalCount += 1;
        }
        else {
          //Update current record
          edges = [...prev?.[connection]?.edges?.map(x => x.node.id === node.id ? {...x, node }: x)];
        }
      }
      else {
        //Remove record which either shop or date is not match
        edges = [...prev?.[connection]?.edges?.filter(x => x.node.id !== node.id)];
        totalCount -= 1;
      }
    }
    else {
      //Update current record
      edges = [...prev?.[connection]?.edges?.map(x => x.node.id === node.id ? {...x, node }: x)];
    }
  }

  return edges ? {
    [connection]: {
      __typename: prev?.[connection].__typename,
      edges,
      pageInfo: prev?.[connection].pageInfo,
      totalCount
    }
  } : prev;
}

export const updateMemberFutureBookingChange = (prev, data, startDate) => {
  if (!data) return prev;

  const bookingChange = data.onBookingChange;
  const {mutation , node, updatedFields, previousValues} = bookingChange;
  const edgeType = "BookingEdge";
  const connection = "bookings";

  let edges = null, totalCount = prev?.[connection].totalCount;
  if (mutation === "CREATED"){
    edges = [...prev?.[connection]?.edges, { node, cursor:"", __typename: edgeType }];
    totalCount += 1;
  }
  else if (mutation === "UPDATED"){
    //remove record if updateFields contain "deleted",
    if (updatedFields.includes('deleted'))
    {
      edges = [...prev?.[connection]?.edges?.filter(x => x.node.id !== node.id)];
      totalCount -= 1;
    }
    else if (updatedFields.includes('date')) {
      if (moment(startDate).isSameOrAfter(moment(node.date))){
        if (moment(previousValues.date).isBefore(moment(node.date))) {
          //Insert new record
          edges = [...prev?.[connection]?.edges, { node, cursor:"", __typename: edgeType }];
          totalCount += 1;
        }
        else {
          //Update current record
          edges = [...prev?.[connection]?.edges?.map(x => x.node.id === node.id ? {...x, node }: x)];
        }
      }
      else {
        //Remove record which either shop or date is not match
        edges = [...prev?.[connection]?.edges?.filter(x => x.node.id !== node.id)];
        totalCount -= 1;
      }

    }
    else {
      //Update current record
      edges = [...prev?.[connection]?.edges?.map(x => x.node.id === node.id ? {...x, node }: x)];
    }
  }

  return edges ? {
    [connection]: {
      __typename: prev?.[connection].__typename,
      edges,
      pageInfo: prev?.[connection].pageInfo,
      totalCount
    }
  } : prev;
}

export const updateUnavailabilityChange = (prev, data, date) => {
  if (!data) return prev;

  const unavailabilityChange = data.onUnavailabilityChange;
  const {mutation , node, updatedFields, previousValues} = unavailabilityChange;
  const edgeType = "UnavailabilityEdge";
  const connection = "unavailabilities";

  let edges = null, totalCount = prev?.[connection].totalCount;
  if (mutation === "CREATED"){
    if(!prev?.[connection]?.edges?.find(x=>x.node.id === node.id)) {
      edges = [...prev?.[connection]?.edges, { node, cursor:"", __typename: edgeType }];
      totalCount += 1;
    }
  }
  else if (mutation === "UPDATED"){
    if (updatedFields.includes('date')) {
      if (node.date === date){
        if (previousValues.date !== node.date) {
          //Insert new record
          edges = [...prev?.[connection]?.edges, { node, cursor:"", __typename: edgeType }];
          totalCount += 1;
        }
        else {
          //Update current record
          edges = [...prev?.[connection]?.edges?.map(x => x.node.id === node.id ? {...x, node }: x)];
        }
      }
      else {
        //Remove record which either shop or date is not match
        edges = [...prev?.[connection]?.edges?.filter(x => x.node.id !== node.id)];
        totalCount -= 1;
      }
    }
    else {
      edges = [...prev?.[connection]?.edges?.map(x => x.node.id === node.id ? {...x, node }: x)];
    }
  }
  else if (mutation === "DELETED"){
    edges = [...prev?.[connection]?.edges?.filter(x => x.node.id !== previousValues.id)];
    totalCount -= 1;
  }

  return edges ? {
    [connection]: {
      __typename: prev?.[connection].__typename,
      edges,
      pageInfo: prev?.[connection].pageInfo,
      totalCount
    }
  } : prev;
}

export const updateMemoChange = (prev, data) => {
  if (!data) return prev;
  const memoChange = data.onMemoChange;
  const {mutation, node, previousValues} = memoChange;
  const edgeType = "MemoEdge";
  const connection = "memos";

  let edges = null, totalCount = prev?.[connection].totalCount;
  if (mutation === "CREATED"){
    edges = [...prev?.[connection]?.edges, { node, cursor:"", __typename: edgeType }];
    totalCount += 1;
  }
  else if (mutation === "UPDATED"){
    edges = [...prev?.[connection]?.edges?.map(x => x.node.id === node.id ? {...x, node }: x)];
  }
  else if (mutation === "DELETED"){
    edges = [...prev?.[connection]?.edges?.filter(x => x.node.id !== previousValues.id)];
    totalCount -= 1;
  }

  return edges ? {
    [connection]: {
      __typename: prev?.[connection].__typename,
      edges,
      pageInfo: prev?.[connection].pageInfo,
      totalCount
    }
  } : prev;
}

export const updateNewOperationLog = (prev, data) => {
  if (!data) return prev;
  const newOperationLog = data.onNewOperationLog;
  const {mutation, node, previousValues} = newOperationLog;
  const edgeType = "OperationLogEdge";
  const connection = "operationLog";

  let edges = null, totalCount = prev?.[connection].totalCount;
  if (mutation === "CREATED"){
    edges = [...prev?.[connection]?.edges, { node, cursor:"", __typename: edgeType }];
    totalCount += 1;
  }
  else if (mutation === "UPDATED"){
    edges = [...prev?.[connection]?.edges?.map(x => x.node.id === node.id ? {...x, node }: x)];
  }
  else if (mutation === "DELETED"){
    edges = [...prev?.[connection]?.edges?.filter(x => x.node.id !== previousValues.id)];
    totalCount -= 1;
  }

  return edges ? {
    [connection]: {
      __typename: prev?.[connection].__typename,
      edges,
      pageInfo: prev?.[connection].pageInfo,
      totalCount
    }
  } : prev;
}

export const updateAssignedMemberChange = (prev, data) => {
  if (!data) return prev;
  const memberChange = data.onMemberChange;
  const {mutation, node, updatedFields, previousValues} = memberChange;
  const edgeType = "MemberEdge";
  const isAssigned = node.consultant !== null && node.staffAssignmentTime !== null;

  let edges = null, totalCount = prev?.totalCount;
  if (mutation === "CREATED"){
    if (isAssigned) {
      edges = [...prev?.edges, { node, cursor:"", __typename: edgeType }];
      totalCount = edges.length;
    }
  }
  else if (mutation === "UPDATED"){
    if (updatedFields.some(f => ['consultantId', 'therapistId', 'staffAssignmentTime'].includes(f))) {
      if (isAssigned) {
        if (prev?.edges.some(x => x.node.id === node.id)) {
          edges = [...prev?.edges?.map(x => x.node.id === node.id ? {...x, node }: x)];
        } else {
          edges = [...prev?.edges, { node, cursor:"", __typename: edgeType }];
          totalCount = edges.length;
        }
      } else {
        if (prev?.edges.some(x => x.node.id === node.id)) {
          edges = [...prev?.edges?.filter(x => x.node.id !== node.id)];
          totalCount = edges.length;
        }
      }
    } else {
      edges = [...prev?.edges?.map(x => x.node.id === node.id ? {...x, node }: x)];
    }
  }
  else if (mutation === "DELETED"){
    if (isAssigned) {
      edges = [...prev?.edges?.filter(x => x.node.id !== previousValues.id)];
      totalCount = edges.length;
    }
  }

  return edges ? {
    __typename: prev?.__typename,
    edges,
    pageInfo: prev?.pageInfo,
    totalCount
  } : prev;
}

export const updateUnAssignedMemberChange = (prev, data) => {
  if (!data) return prev;
  const memberChange = data.onMemberChange;
  const {mutation, node, updatedFields, previousValues} = memberChange;
  const edgeType = "MemberEdge";
  const isAssigned = node.consultant !== null && node.staffAssignmentTime !== null;

  let edges = null, totalCount = prev?.totalCount;
  if (mutation === "CREATED"){
    if (!isAssigned) {
      edges = [...prev?.edges, { node, cursor:"", __typename: edgeType }];
      totalCount = edges.length;
    }
  }
  else if (mutation === "UPDATED"){
    if (updatedFields.some(f => ['consultantId', 'therapistId', 'staffAssignmentTime'].includes(f))) {
      if (!isAssigned) {
        if (prev?.edges.some(x => x.node.id === node.id)) {
          edges = [...prev?.edges?.map(x => x.node.id === node.id ? {...x, node }: x)];
        } else {
          edges = [...prev?.edges, { node, cursor:"", __typename: edgeType }];
          totalCount = edges.length;
        }
      } else {
        if (prev?.edges.some(x => x.node.id === node.id)) {
          edges = [...prev?.edges?.filter(x => x.node.id !== node.id)];
          totalCount = edges.length;
        }
      }
    } else {
      edges = [...prev?.edges?.map(x => x.node.id === node.id ? {...x, node }: x)];
    }
  }
  else if (mutation === "DELETED"){
    if (!isAssigned) {
      edges = [...prev?.edges?.filter(x => x.node.id !== previousValues.id)];
      totalCount = edges.length;
    }
  }

  return edges ? {
    __typename: prev?.__typename,
    edges,
    pageInfo: prev?.pageInfo,
    totalCount
  } : prev;
}

export const updateMemberPurchaseCountChange = (prev, data, config = {}, dataEdges) => {
  if (!data) return prev;
  const memberChange = data.onMemberChange;
  const {mutation} = memberChange;
  const connection = "members";
  console.log('updateMemberPurchaseCountChange', prev, data, dataEdges);

  let totalCount = prev?.[connection].totalCount;
  if (mutation === "CREATED"){
  }
  else if (mutation === "UPDATED"){
  }
  else if (mutation === "DELETED"){
    // totalCount -= 1;
  }
  
  return {
    [connection]: {
      ...prev?.[connection],
      totalCount
    }
  };
}

export const updatePurchaseCountChange = (prev, data, config = {}, dataEdges) => {
  if (!data) return prev;
  const purchaseOrderChange = data.onPurchaseOrderChange;
  const {mutation, node} = purchaseOrderChange;
  const connection = "members";
  const memberExists = dataEdges.map(member => member.node.id).includes(node?.member?.id);
  console.log('updatePurchaseCountChange', prev, data, dataEdges);

  let totalCount = prev?.[connection].totalCount;
  if (mutation === "CREATED"){
    if (!memberExists) {
      totalCount += 1;
    }
  }
  else if (mutation === "UPDATED"){
  }
  else if (mutation === "DELETED"){
    // totalCount -= 1;
  }
  
  return {
    [connection]: {
      ...prev?.[connection],
      totalCount
    }
  };
}

export const updateInvoiceCountChange = (prev, data, config = {}) => {
  if (!data) return prev;
  const invoiceChange = data.onInvoiceChange;
  const {mutation, node, previousValues} = invoiceChange;
  const connection = "invoices";
  const { variables: { status, authorizationStatuses } = {} } = config;
  const wasCorrectStatus = (!status || previousValues?.status === status) && (!authorizationStatuses || authorizationStatuses?.includes(previousValues?.authorizationStatus));
  const isCorrectStatus = (!status || node?.status === status) && (!authorizationStatuses || authorizationStatuses?.includes(node?.authorizationStatus));
  console.log('updateInvoiceCountChange', prev, data, config);

  let totalCount = prev?.[connection].totalCount;
  if (mutation === "CREATED"){
    if (isCorrectStatus) {
      totalCount += 1;
    }
  }
  else if (mutation === "UPDATED"){
    if (wasCorrectStatus && !isCorrectStatus) {
      totalCount -= 1;
    } else if (!wasCorrectStatus && isCorrectStatus) {
      totalCount += 1;
    }
  }
  else if (mutation === "DELETED"){
    // totalCount -= 1;
  }

  return {
    [connection]: {
      ...prev?.[connection],
      totalCount
    }
  };
}

export const updatePromotionApprovalCountChange = (prev, data, config = {}) => {
  if (!data) return prev;
  const invoiceChange = data.onInvoiceChange;
  const {mutation, node, previousValues} = invoiceChange;
  const connection = "invoices";
  const { variables: { status, authorizationStatuses } = {} } = config;
  const wasCorrectStatus = (!status || previousValues?.status === status) && (!authorizationStatuses || authorizationStatuses?.includes(previousValues?.authorizationStatus));
  const isCorrectStatus = (!status || node?.status === status) && (!authorizationStatuses || authorizationStatuses?.includes(node?.authorizationStatus));
  console.log('updatePromotionApprovalCountChange', prev, data, config);

  let totalCount = prev?.[connection].totalCount;
  if (mutation === "CREATED"){
    if (isCorrectStatus) {
      totalCount += 1;
    }
  }
  else if (mutation === "UPDATED"){
    if (wasCorrectStatus && !isCorrectStatus) {
      totalCount -= 1;
    } else if (!wasCorrectStatus && isCorrectStatus) {
      totalCount += 1;
    }
  }
  else if (mutation === "DELETED"){
    // totalCount -= 1;
  }

  return {
    [connection]: {
      ...prev?.[connection],
      totalCount
    }
  };
}