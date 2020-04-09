const getTestForAPersonId = async(personId, admin) => {
  const testsForAPerson = await admin.firestore()
    .collection(`/person/${personId}/test`)// referencia
    .get()
  const tests = []
  testsForAPerson.forEach((test, index) => {
    tests[index] = test.data()
    tests[index].id = test.id
  })
  return testsForAPerson
}

module.exports = {
  getTestForAPersonId,
}
