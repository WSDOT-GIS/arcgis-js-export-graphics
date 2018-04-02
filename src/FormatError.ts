export default class FormatError extends Error {
  /**
   * Creates a new FormatError instance
   * @param input The input that wasn't in the correct format.
   * @param format The expected format
   */
  constructor(public readonly input: string, public readonly format: RegExp) {
    super(
      `Input string was not in expected format.\nExpected ${
        format.source
      }\nGot ${input}`
    );
  }
}
