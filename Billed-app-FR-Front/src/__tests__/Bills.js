/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from '../containers/Bills.js'
import router from "../app/Router.js";

//Vérification que l'icône de facture est mise en évidence lorsque l'utilisateur se trouve sur la page des factures.
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    })

    //Vérification que les factures sont affichées dans l'ordre attendu.
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

//My tests
// Vérification que handleClickNewBill navigue vers la page de création d'une nouvelle facture.
test('Then handleClickNewBill should navigate to new bill page', () => {
  
  const onNavigate = jest.fn();
  const billsContainer = new Bills({
    document: document,
    onNavigate: onNavigate,
    localStorage: window.localStorage
  });

  billsContainer.handleClickNewBill();

  expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
});

//Vérification que le document est affiché dans une fenêtre modale lorsqu'on clique sur une icône d'œil pour voir une facture.
describe('Given I am a user on Bills Page', () => {
  describe('When I click on an eye icon to view a bill', () => {
    test('Then the bill should be displayed in a modal', () => {
      // Given
      const mockModal = jest.fn(); 
      $.fn.modal = mockModal; 

      document.body.innerHTML = `<div id="modaleFile"><div class="modal-body"></div></div>`;

      const onNavigate = jest.fn();
      const billsContainer = new Bills({
        document: document,
        onNavigate: onNavigate,
        store: null,
        localStorage: window.localStorage
      });

      const icon = document.createElement('div');
      icon.setAttribute('data-bill-url', 'http://example.com/bill.jpg');

      // When
      billsContainer.handleClickIconEye(icon);

      // Then
      const modalBody = document.querySelector('.modal-body');
      expect(modalBody.innerHTML).toContain('http://example.com/bill.jpg');
      expect(mockModal).toHaveBeenCalledWith('show'); 
    });
  });
});

// Vérification que la méthode getBills retourne les factures triées et formatées conformément aux attentes.
describe('Given I am a user on Bills Page', () => {
  describe('When I call getBills method', () => {
    test('Then it should return sorted and formatted bills', async () => {
      // Given
      const onNavigate = jest.fn();
      const mockStore = {
        bills: () => ({
          list: () =>
            Promise.resolve([
              { date: '2023-01-01', status: 'pending' },
              { date: '2023-02-01', status: 'accepted' },
            ]),
        }),
      };
      const billsContainer = new Bills({
        document: document,
        onNavigate: onNavigate,
        localStorage: window.localStorage,
        store: mockStore,
      });

      // When
      const bills = await billsContainer.getBills();

      // Then
      expect(bills).toEqual([
        { date: '1 Fév. 23', status: 'Accepté' },
        { date: '1 Jan. 23', status: 'En attente' },
      ]);
    });
  });
});



// Test d'intégration GET
describe('Bills', () => {
  describe('Given I am connected as an Employee', () => {
    describe('When I am on Bills Page', () => {
      test('Then it should load bills', async () => {
        // Given
        const html = `<div>
          <button data-testid="btn-new-bill"></button>
          <div data-testid="icon-eye" data-bill-url="testUrl"></div>
        </div>`;
        document.body.innerHTML = html;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES_PATH[pathname];
        };

        const mockStore = {
          bills: jest.fn().mockReturnValue({
            list: jest.fn().mockResolvedValue([{ date: '2023-06-29', status: 'refused' }])
          })
        };

        const localStorageMock = jest.fn();

        const bills = new Bills({ document, onNavigate, store: mockStore, localStorage: localStorageMock });

        // When
        const billsList = await bills.getBills();

        // Then
        expect(billsList.length).toBe(1);
      });

      test('Then it should navigate to new bill page', () => {
        // Given
        const onNavigate = jest.fn();
        new Bills({ document, onNavigate, store: {}, localStorage: {} });
        const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`);

        // When
        buttonNewBill.click();

        // Then
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
      });

      test('Then it should open the modal when icon eye is clicked', () => {
        // Given
        const html = `<div>
            <button data-testid="btn-new-bill"></button>
            <div data-testid="icon-eye" data-bill-url="testUrl"></div>
          </div>`;
        document.body.innerHTML = html;
        const iconEye = document.querySelector(`div[data-testid="icon-eye"]`);
        $.fn.modal = jest.fn(); 

        Object.defineProperty(window, 'localStorage', {
          value: {
            getItem: jest.fn().mockReturnValue(JSON.stringify({ type: "Employee", email: "employee@company.com" })),
            setItem: jest.fn()
          },
          writable: true
        });

        // When
        new Bills({ document, onNavigate: () => { }, store: {}, localStorage: window.localStorage });
        iconEye.click();

        // Then
        expect($.fn.modal).toHaveBeenCalledWith('show');
      });
    });

    describe('When an error occurs with the API', () => {
      test('Then it should handle API 404 error', async () => {
        // Given
        const onNavigate = jest.fn();
        const mockStore = {
          bills: jest.fn().mockReturnValue({
            list: jest.fn().mockRejectedValue(new Error('Erreur 404'))
          })
        };

        const localStorageMock = jest.fn();
        const bills = new Bills({ document, onNavigate, store: mockStore, localStorage: localStorageMock });

        // Then
        await expect(bills.getBills()).rejects.toThrow('Erreur 404');
      });

      test('Then it should handle API 500 error', async () => {
        // Given
        const onNavigate = jest.fn();
        const mockStore = {
          bills: jest.fn().mockReturnValue({
            list: jest.fn().mockRejectedValue(new Error('Erreur 500'))
          })
        };

        const localStorageMock = jest.fn();
        const bills = new Bills({ document, onNavigate, store: mockStore, localStorage: localStorageMock });

        // Then
        await expect(bills.getBills()).rejects.toThrow('Erreur 500');
      });
    });
  });
});


