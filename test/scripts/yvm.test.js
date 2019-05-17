import mockProps from 'jest-mock-props'
import log from 'util/log'
import { program } from 'yvm'

mockProps.extend(jest)

describe('yvm commands', () => {
    jest.spyOn(process, 'exit').mockImplementation(jest.fn())
    const argSpy = jest.spyOnProp(process, 'argv')
    const stdOutSpy = jest.fn()
    const stdErrSpy = jest.fn()
    const mockStdOut = (...args) =>
        jest.spyOn(...args).mockImplementation(s => stdOutSpy(String(s)))
    const mockStdErr = (...args) =>
        jest.spyOn(...args).mockImplementation(s => stdErrSpy(String(s)))

    const concatMockCalls = spy => {
        return spy.mock.calls
            .map(args => args.join(' ').trim())
            .join('\n')
            .trim()
    }

    const flush = () => new Promise(resolve => setTimeout(resolve))

    const runWithArgs = async (...args) => {
        argSpy.mockValue(['node', 'yvm.js', ...args])
        program(process.argv).parse(process.argv)
        await flush()
        return {
            stderr: concatMockCalls(stdErrSpy),
            stdout: concatMockCalls(stdOutSpy),
        }
    }

    beforeAll(() => {
        mockStdOut(process.stdout, 'write')
        mockStdOut(console, 'log')
        mockStdOut(log, 'capturable')
        mockStdErr(process.stderr, 'write')
        mockStdErr(console, 'error')
        mockStdErr(log, 'default')
    })
    beforeEach(jest.clearAllMocks)
    afterAll(jest.restoreAllMocks)

    describe('default', () => {
        it('shows error message when wrong args passed', async () => {
            expect((await runWithArgs('wrong', 'args')).stderr).toContain(
                'Invalid command: wrong',
            )
            expect(process.exit).toHaveBeenCalledWith(1)
        })
    })

    describe('help', () => {
        it('shows all help with --help', async () => {
            expect((await runWithArgs('--help')).stdout).toMatchSnapshot()
            expect(process.exit).toHaveBeenCalledWith(0)
        })
    })

    describe('use', () => {
        it('does not use in non shell context', async () => {
            expect((await runWithArgs('use')).stderr).toContain(
                'You need to source yvm to use this command. run `source ~/.yvm/yvm.sh`',
            )
            expect(process.exit).toHaveBeenCalledWith(1)
        })
    })

    describe('current', () => {
        it('shows yarn version', async () => {
            expect((await runWithArgs('current')).stdout).toMatchSnapshot()
            expect(process.exit).toHaveBeenCalledWith(0)
        })
    })
})
