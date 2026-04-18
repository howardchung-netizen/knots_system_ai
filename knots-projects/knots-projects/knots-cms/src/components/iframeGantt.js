import React from 'react';

const IframeGantt = ({
  appToken,
  REACT_APP_KQS_HTTPS_ENDPOINT,
  REACT_APP_TODO_HTTP_ENDPOINT,
  REACT_APP_TODO_GRAPHQL_ENDPOINT,
  REACT_APP_TODO_WEBSOCKET_ENDPOINT,
  REACT_APP_KQS_SHARE_LINK,
  REACT_APP_EXPORT_SERVER_HOST,
}) => {
  const queryParam = new URLSearchParams(window.location.search);
  const projectName = queryParam.get('projectName');
  const language = queryParam.get('language');

  const path = `/iframe${window.location.pathname}?project_name=${projectName}&language=${language}&ganttChart_token=${appToken}&REACT_APP_KQS_HTTPS_ENDPOINT=${REACT_APP_KQS_HTTPS_ENDPOINT}&REACT_APP_TODO_HTTP_ENDPOINT=${REACT_APP_TODO_HTTP_ENDPOINT}&REACT_APP_TODO_GRAPHQL_ENDPOINT=${REACT_APP_TODO_GRAPHQL_ENDPOINT}&REACT_APP_TODO_WEBSOCKET_ENDPOINT=${REACT_APP_TODO_WEBSOCKET_ENDPOINT}&REACT_APP_KQS_SHARE_LINK=${REACT_APP_KQS_SHARE_LINK}&REACT_APP_EXPORT_SERVER_HOST=${REACT_APP_EXPORT_SERVER_HOST}`;
  return (
    <iframe
      src={path}
      style={{
        width: '100vw',
        height: '100vh',
      }}
      frameBorder="0"
      title="Gantt Chart"
    ></iframe>
  );
};

export default IframeGantt;
