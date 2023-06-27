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

//MY TESTS

//Vérification que le clic sur le bouton "Nouvelle facture" redirige vers la bonne page.
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

//Vérification que le clic sur l'icône "œil" affiche bien la facture correspondante.
test('Then handleClickIconEye should display the bill', () => {
  // Simuler la fonction .modal() de Bootstrap
  $.fn.modal = jest.fn();

  document.body.innerHTML = `<div id="modaleFile">
    <div class="modal-body"></div>
  </div>`;
  
  const onNavigate = jest.fn();
  const billsContainer = new Bills({
    document: document,
    onNavigate: onNavigate,
    localStorage: window.localStorage
  });

  const icon = document.createElement('div');
  icon.setAttribute('data-bill-url', 'http://example.com/bill.jpg');
  billsContainer.handleClickIconEye(icon);

  const modalBody = document.querySelector('.modal-body');
  expect(modalBody.innerHTML).toContain('http://example.com/bill.jpg');
  expect($.fn.modal).toHaveBeenCalledWith('show');  // Vérifie que .modal('show') a été appelé
});

//Vérification que la méthode getBills() renvoie les factures dans le format attendu.
test('getBills should return sorted and formatted bills', async () => {
  const onNavigate = jest.fn();
  const mockStore = {
    bills: () => ({
      list: () => Promise.resolve([
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

  const bills = await billsContainer.getBills();
  
  expect(bills).toEqual([
    { date: '1 Fév. 23', status: 'Accepté', },
    { date: '1 Jan. 23', status: 'En attente', },
  ]);
});


 // Test d'intégration GET a faire

