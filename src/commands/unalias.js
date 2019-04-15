import log from 'util/log'
import { unsetAlias } from 'util/alias'

export const unalias = async ({ name, force, recursive }) => {
    try {
        const deleted = await unsetAlias({ name, force, recursive })
        if (!deleted) {
            return 1
        }
        log('Alias successfully deleted')
        return 0
    } catch (e) {
        log(e.message)
        return 2
    }
}
