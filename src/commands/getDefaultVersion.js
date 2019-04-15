import log from 'util/log'
import { getDefaultVersion as getDefault } from 'util/version'

export const getDefaultVersion = async () => {
    try {
        const version = await getDefault()
        if (version) {
            log.capturable(version)
            return 0
        }
        log('No default yarn version set')
        return 1
    } catch (e) {
        log.error(e.message)
        log.info(e.stack)
        return 2
    }
}
