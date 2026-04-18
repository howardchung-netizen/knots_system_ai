import { Grid } from "@mui/material"
import { InfoCard } from "../components/InfoCard"
import { MultipleSelectCheckmarks } from "../components/MultiSelect"
import { gql, useLazyQuery, useQuery } from "@apollo/client"
import { projectOrdersQuery, projectStatussQuery, projectsQuery, quotationStatusesQuery, quotationsQuery } from "../apollo/queries"
import { useEffect, useMemo, useState } from "react"
import { dashboradProjectFragment, dashboradProjectOrderFragment, dashboradQuotationFragment } from "../apollo/fragments"
import { ProjectCard, ProjectCardLoading } from "../components/ProjectCard"
import styled from "@emotion/styled"
import { QuotationCard, QuotationCardLoading } from "../components/QuotationCard"
import { ProjectOrderCard, ProjectOrderCardLoading } from "../components/ProjectOrderCard"

const ListContainer = styled('div')(({ theme }) => ({
  maxHeight: 'calc(100vh - 230px)',
  overflow: 'auto', 
  marginTop: 10,
  borderWidth: 1,
  borderRadius: 5,
  borderStyle: 'groove',
}))

export default () => {

  const localStorageProjectStatusValue = window.localStorage.getItem('projectStatusValue');
  const localStorageQuotationStatusValue = window.localStorage.getItem('quotationStatusValue');

  const [projectStatusValue, setProjectStatusValue] = useState(localStorageProjectStatusValue ? localStorageProjectStatusValue.split(',') : []);
  const [quotationStatusValue, setQuotationStatusValue] = useState(localStorageQuotationStatusValue ? localStorageQuotationStatusValue.split(',') : []);
  const [dashboradProjectsQuery, dashboradProjectsStatus] =  useLazyQuery(gql`${projectsQuery} ${dashboradProjectFragment}`)
  const projects = useMemo(() => {
    let projects = [];
    if(dashboradProjectsStatus.data?.projects.edges?.length > 0){
      projects = dashboradProjectsStatus.data.projects.edges.map((edge)=>edge.node)
     }
     return projects
  }, [dashboradProjectsStatus.data])

  const projectStatuss =  useQuery(projectStatussQuery)
  const projectStatussOptions = useMemo(() => {
    let projectStatussOptions = [];
    if(projectStatuss.data?.projectStatuss.edges?.length > 0){
      projectStatussOptions = projectStatuss.data.projectStatuss.edges.map((edge)=>{
        return {
          label: edge.node.nameCht,
          value: edge.node.id,
          key: edge.node.id
        }
      })
      if (!localStorageProjectStatusValue) setProjectStatusValue(projectStatussOptions.map(e => e.value));
     }
     return projectStatussOptions
  }, [projectStatuss.data])

  const [dashboradQuotationsQuery, dashboradQuotationsStatus] =  useLazyQuery(gql`${quotationsQuery} ${dashboradQuotationFragment}`)
  const quotations = useMemo(() => {
    let quotations = [];
    if(dashboradQuotationsStatus.data?.quotations.edges?.length > 0){
      quotations = dashboradQuotationsStatus.data.quotations.edges.map((edge)=>edge.node)
     }
     return quotations
  }, [dashboradQuotationsStatus.data])

  const quotationStatuses =  useQuery(quotationStatusesQuery)
  const quotationStatusesOptions = useMemo(() => {
    let quotationStatusesOptions = [];
    if (quotationStatuses.data?.quotationStatuses.edges?.length > 0) {
      quotationStatusesOptions = quotationStatuses.data.quotationStatuses.edges.map((edge) => {
        return {
          label: edge.node.nameCht,
          value: edge.node.id,
          key: edge.node.id
        }
      })
      if (!localStorageQuotationStatusValue) setQuotationStatusValue(quotationStatusesOptions.map(e => e.value));
    }
     return quotationStatusesOptions
  }, [quotationStatuses.data])

  const [dashboradProjectOrdersQuery, dashboradProjectOrdersStatus] =  useLazyQuery(gql`${projectOrdersQuery} ${dashboradProjectOrderFragment}`)
  const projectOrders = useMemo(() => {
    let projectOrders = [];
    if(dashboradProjectOrdersStatus.data?.projectOrders.edges?.length > 0){
      projectOrders = dashboradProjectOrdersStatus.data.projectOrders.edges.map((edge)=>edge.node)
     }
     return projectOrders
  }, [dashboradProjectOrdersStatus.data])

  useEffect(() => {
    dashboradProjectsQuery({
      variables: {
        statusArray: projectStatusValue.length ? projectStatusValue : null
      }
    })
  }, [projectStatusValue])

  useEffect(() => {
    if(quotationStatusValue.length)
    dashboradQuotationsQuery({
      variables: {
        progressArray: quotationStatusValue.length ? quotationStatusValue : null
      }
    })
  }, [quotationStatusValue])

  useEffect(() => {
    dashboradProjectOrdersQuery()
  }, [])
  
  return (
    <Grid container spacing={2} padding={1}>
      <Grid item xs={12} sm={4} md={4} padding={0}>
        <InfoCard title="工程">
          <MultipleSelectCheckmarks
            label={'工程狀態'}
            items={projectStatussOptions}
            onChange={(e)=>{
              setProjectStatusValue(e)
              localStorage.setItem('projectStatusValue', e)
            }}
            value={projectStatusValue}
          />
          <ListContainer>
          {
            !dashboradProjectsStatus.data && <ProjectCardLoading />
          }  
          {
            projects.map((data)=>{
              return <ProjectCard key={data.id} {...data} 
              // status={projectStatussOptions.find(e=> e.value == data.status).label}
              />
            })
          }
          </ListContainer>
        </InfoCard>
      </Grid>
      <Grid item xs={12} sm={4} md={4} padding={0}>
        <InfoCard title="報價單"> 
          <MultipleSelectCheckmarks
            label={'報價單狀態'}
            items={quotationStatusesOptions}
            onChange={(e)=>{
              setQuotationStatusValue(e)
              localStorage.setItem('quotationStatusValue', e)
            }}
            value={quotationStatusValue}
          />
          <ListContainer>
          {
            !dashboradQuotationsStatus.data && <QuotationCardLoading />
          }  
          {
            quotations.map((data)=>{
              return <QuotationCard key={data.id} {...data}/>
            })
          }
          </ListContainer>
        </InfoCard>
      </Grid>
      <Grid item xs={12} sm={4} md={4} padding={0}>
        <InfoCard title="訂單">
          <div style={{marginTop: 63}}></div>
          <ListContainer>
            {
              !dashboradProjectOrdersStatus.data && <ProjectOrderCardLoading />
            }
            {
              projectOrders.map((data) => {
                return <ProjectOrderCard key={data.id} {...data}/>
              })
            }
          </ListContainer>
        </InfoCard>
      </Grid>
    </Grid>
  )
}