import log from 'util/log'
import { setDefaultVersion } from 'util/version'

export const setDefault = async version => {
    try {
        if (!(await setDefaultVersion({ version }))) {
            return 1
        }
        log('Default version set!')
        return 0
    } catch (e) {
        log.error(e.message)
        return 2
    }
}
