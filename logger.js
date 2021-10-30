import dateformat from 'dateformat';

export default function logger() {

    const log = (message, topic) => {
        const timestamp = dateformat(new Date(), 'yy-mm-dd HH:MM:ss');
        console.log(`\x1b[33m[${timestamp}] \x1b[36m${topic ? topic : 'Log'} \x1b[0m: ${message}`);
    };
    
    const error = (message, topic) => {
        const timestamp = dateformat(new Date(), 'yy-mm-dd HH:MM:ss');
        console.log(`\x1b[33m[${timestamp}] \x1b[31m${topic ? topic : 'ERROR'} \x1b[0m: \x1b[31m${message}\x1b[0m`);
    }

    return {
        log, error
    };
}