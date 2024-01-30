import type { HttpRequest, HttpResponse } from '../protocols/http-protocol'
import type { CpfValidator } from '../protocols/cpf-validator'
import type { AddClient } from '../../domain/useCases/add-client'
import { MissingParamError } from '../../errors/missing-param-error'
import { badRequest, invalidCpf, serverError } from '../helpers/http-helper'

export class RegisterController {
  private readonly cpfValidator: CpfValidator
  private readonly addClient: AddClient

  constructor (cpfValidator: CpfValidator, addClient: AddClient) {
    this.cpfValidator = cpfValidator
    this.addClient = addClient
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const requiredParams = ['name', 'cpf', 'birthDate']
      for (const param of requiredParams) {
        if (!httpRequest.body[param]) {
          return badRequest(new MissingParamError(param))
        }
      }

      const { name, cpf, birthDate } = httpRequest.body
      const isValid = this.cpfValidator.checkValidity(cpf)
      if (!isValid) return invalidCpf()

      const clientCreated = await this.addClient.add({ name, cpf, birthDate })
      return {
        statusCode: 201,
        body: clientCreated
      }
    } catch (error) {
      return serverError()
    }
  }
}