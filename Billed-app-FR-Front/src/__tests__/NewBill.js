/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, render, waitFor } from "@testing-library/dom";
import '@testing-library/jest-dom/extend-expect';
import NewBill from "../containers/NewBill.js";
import { ROUTES} from "../constants/routes.js";
jest.mock('../__mocks__/store');

// Vérifie qu'un utilisateur peut sélectionner et charger un fichier lors de la création d'une nouvelle facture.
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and I choose a file", () => {
    test("Then it should call handleChangeFile", () => {
      // Given
      const html = `
        <form data-testid="form-new-bill">
          <input type="file" data-testid="file" />
        </form>
      `
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill = new NewBill({ 
        document, onNavigate, localStorage: window.localStorage
      })

      // When
      const handleChangeFile = jest.spyOn(newBill, 'handleChangeFile')
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener("change", newBill.handleChangeFile.bind(newBill))
      fireEvent.change(inputFile, { target: { files: [new File(['file'], 'file.png', { type: 'image/png' })] } })

      // Then
      expect(handleChangeFile).toHaveBeenCalled();
    })
  })
})

// Vérifie que l'utilisateur peut ajouter un fichier à sa facture
describe("Given I am a user connected as Employee", () => {
  describe("When I am on NewBill Page and I add a file", () => {
    test("Then it should call formData.append with 'file' and 'email'", () => {
      // Given
      const onNavigate = jest.fn()
      const localStorage = window.localStorage
      localStorage.setItem("user", JSON.stringify({ email: 'test@email.com' }))
      const appendSpy = jest.spyOn(FormData.prototype, 'append')
      const document = {
        querySelector: jest.fn().mockImplementation(selector => {
          switch(selector) {
            case `form[data-testid="form-new-bill"]`:
              return { addEventListener: jest.fn() }
            case `input[data-testid="file"]`:
              return { 
                addEventListener: jest.fn(), 
                files: ['file']
              }
            default:
              return null;
          }
        }) 
      }
      const store = { 
        bills: jest.fn().mockReturnValue({
          create: jest.fn().mockResolvedValue({ filePath: 'filePath', key: 'key' })
        })
      }

      const newBill = new NewBill({ document, onNavigate, store, localStorage })

      // When
      newBill.handleChangeFile({ 
        preventDefault: () => {}, 
        target: {
          value: 'C:\\fakepath\\file.png',
          files: ['file']
        }
      })

      // Then
      expect(appendSpy).toHaveBeenCalledWith('file', 'file')
      expect(appendSpy).toHaveBeenCalledWith('email', 'test@email.com')

      // Clean up
      appendSpy.mockRestore()
      localStorage.removeItem('user')
    })
  })
})

//Test d'intégration POST

describe("Given I am a user connected as Employee", () => {
  describe("When I am on NewBill Page and I submit the form", () => {
    test("Then it should call store.bills().create and onNavigate", async () => {
      // Given
      const onNavigate = jest.fn()
      window.localStorage.setItem("user", JSON.stringify({ email: 'test@email.com' }))
      const store = {
        bills: jest.fn().mockReturnValue({
          create: jest.fn().mockResolvedValue({ filePath: 'filePath', key: 'key' }),
          update: jest.fn().mockResolvedValue()
        })
      }
      const formDataMock = {
        append: jest.fn(),
      };
      global.FormData = jest.fn(() => formDataMock);

      const documentMock = {
        querySelector: jest.fn().mockImplementation((selector) => {
          switch (selector) {
            case `form[data-testid="form-new-bill"]`:
              return { addEventListener: jest.fn() }
            case `input[data-testid="file"]`:
              return {
                files: [new File(["content"], "file.png")],
                addEventListener: jest.fn(),
              };
            default:
              return null;
          }
        }),
      };

      const newBill = new NewBill({ document: documentMock, onNavigate, store, localStorage: window.localStorage })

      // When
      await newBill.handleChangeFile({
        preventDefault: jest.fn(),
        target: {
          value: "path\\to\\file.png",
        },
      });
      await newBill.handleSubmit({
        preventDefault: jest.fn(),
        target: {
          querySelector: jest.fn().mockImplementation((selector) => {
            switch (selector) {
              case `input[data-testid="datepicker"]`:
                return { value: "2022-01-01" };
              case `select[data-testid="expense-type"]`:
                return { value: "restaurant" };
              case `input[data-testid="expense-name"]`:
                return { value: "dinner" };
              case `input[data-testid="amount"]`:
                return { value: "100" };
              case `input[data-testid="vat"]`:
                return { value: "20" };
              case `input[data-testid="pct"]`:
                return { value: "20" };
              case `textarea[data-testid="commentary"]`:
                return { value: "test commentary" };
              default:
                return null;
            }
          }),
        },
      });

      // Then
      expect(store.bills().create).toHaveBeenCalled()
      expect(onNavigate).toHaveBeenCalled()

      // Clean up
      localStorage.removeItem('user')
    })
  })
})






