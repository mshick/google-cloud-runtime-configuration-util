import {printVariableList, GrcVariableList, GrcPrintFormat, GrcPrintVariableFormat} from '../src/grcutil'

const variableListFixture: GrcVariableList = {
  variables: [
    {name: 'fooBar', value: 'lala'},
    {name: 'foo________bar', value: 'lala'},
    {name: 'FOO_BAR', value: 'lalal'},
    {name: 'FoObARr', value: 'lalal'},
    {name: 'foo--ba-r', value: 'lala'},
    {name: 'foo-bar', value: 'lala'},
    {name: '--foo--bar', value: 'lala'},
    {name: '__foo_bar', value: 'lala'},
  ],
}

const expectedEnvOutput = `FOO_BAR=lala
FOO________BAR=lala
FOO_BAR=lalal
FO_OB_A_RR=lalal
FOO__BA_R=lala
FOO_BAR=lala
__FOO__BAR=lala
__FOO_BAR=lala
`

beforeEach(() => {
  jest.resetModules()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('grcutil library', () => {
  it('converts variable cases properly in printenv', () => {
    const envString = printVariableList(variableListFixture, GrcPrintFormat.Env, GrcPrintVariableFormat.Constant)
    expect(envString).toEqual(expectedEnvOutput)
  })
})
