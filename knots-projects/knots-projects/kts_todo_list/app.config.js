module.exports = {
    apps: [{
        name          : 'todo',
        script        : 'index.js',
        watch         : false,
        // node_args     : '--expose-gc --gc_global --max-old-space-size=250',
        env           : { 'LD_PRELOAD': '/usr/lib/x86_64-linux-gnu/libjemalloc.so.1', 'NODE_ENV': 'production', 'TZ': 'Asia/Hong_Kong' },
        env_production: { 'LD_PRELOAD': '/usr/lib/x86_64-linux-gnu/libjemalloc.so.1', 'NODE_ENV': 'production', 'TZ': 'Asia/Hong_Kong' },
        // wait_ready    : true,
        // listen_timeout: 10000,
        // kill_timeout  : 10000,
        // exec_mode     : 'cluster',
        // instances     : 1
    }]
};
