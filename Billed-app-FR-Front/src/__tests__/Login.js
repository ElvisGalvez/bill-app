/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { fireEvent, screen } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    test("Then I should be identified as an Employee in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty",
      };

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-employee");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitEmployee);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders Bills page", () => {
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
});

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected",
      };

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-admin");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders HR dashboard page", () => {
      expect(screen.queryByText("Validations")).toBeTruthy();
    });
  });
});


//MY TESTS

// Verify that the createUser method is called when employee login fails
describe("Given an employee login attempt", () => {
  test("When login fails, Then it should call createUser", done => {
    // Given
    document.body.innerHTML = LoginUI();
    const inputData = {
      email: "johndoe@email.com",
      password: "azerty",
    };
    
    const inputEmailUser = screen.getByTestId("employee-email-input");
    fireEvent.change(inputEmailUser, { target: { value: inputData.email } });

    const inputPasswordUser = screen.getByTestId("employee-password-input");
    fireEvent.change(inputPasswordUser, { target: { value: inputData.password } });

    const form = screen.getByTestId("form-employee");

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => null),
      },
      writable: true,
    });

    const onNavigate = jest.fn();
    const store = { login: jest.fn().mockRejectedValue(new Error('Login failed')) };
    const login = new Login({
      document,
      localStorage: window.localStorage,
      onNavigate,
      PREVIOUS_LOCATION: "",
      store,
    });

    login.createUser = jest.fn().mockResolvedValue({});

    const handleSubmit = jest.fn(login.handleSubmitEmployee);
    form.addEventListener("submit", handleSubmit);

    // When
    fireEvent.submit(form);
    
    // Then
    setTimeout(() => {
      expect(login.createUser).toHaveBeenCalled();
      expect(login.createUser).toHaveBeenCalledWith({
        type: "Employee",
        email: inputData.email,
        password: inputData.password,
        status: "connected",
      });
      done();
    }, 0);
  });
});

// Verify that the createUser method is called when admin login fails
describe("Given an admin login attempt", () => {
  test("When login fails, Then it should call createUser", done => {
    // Given
    document.body.innerHTML = LoginUI();
    const inputData = {
      email: "admin@email.com",
      password: "azerty",
    };

    const inputEmailAdmin = screen.getByTestId("admin-email-input");
    fireEvent.change(inputEmailAdmin, { target: { value: inputData.email } });

    const inputPasswordAdmin = screen.getByTestId("admin-password-input");
    fireEvent.change(inputPasswordAdmin, { target: { value: inputData.password } });

    const form = screen.getByTestId("form-admin");

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => null),
      },
      writable: true,
    });

    const onNavigate = jest.fn();
    const store = { login: jest.fn().mockRejectedValue(new Error('Login failed')) };
    const login = new Login({
      document,
      localStorage: window.localStorage,
      onNavigate,
      PREVIOUS_LOCATION: "",
      store,
    });

    login.createUser = jest.fn().mockResolvedValue({});

    const handleSubmit = jest.fn(login.handleSubmitAdmin);
    form.addEventListener("submit", handleSubmit);

    // When
    fireEvent.submit(form);

    // Then
    setTimeout(() => { //ensure the the expect assertions is run after the form has been submitted and any promises have been resolved or rejected.
      expect(login.createUser).toHaveBeenCalled();
      expect(login.createUser).toHaveBeenCalledWith({
        type: "Admin",
        email: inputData.email,
        password: inputData.password,
        status: "connected",
      });
      done();
    }, 0); // specifies the delay before the execution of the callback
  });
});

// Verify that a JWT is stored upon successful login
describe("Given a successful login attempt", () => {
  test("When the login method is called, Then it should set JWT in local storage", async () => {
    // Given
    const mockUser = {
      email: 'test@example.com',
      password: 'testpassword',
    };
    const mockJwt = 'fake.jwt.token';

    const store = {
      login: jest.fn().mockResolvedValue({ jwt: mockJwt }),
    };
    const localStorageSpy = jest.spyOn(window.localStorage, 'setItem');

    const login = new Login({
      document,
      localStorage: window.localStorage,
      onNavigate: jest.fn(),
      PREVIOUS_LOCATION: "",
      store,
    });

    // When
    await login.login(mockUser);

    // Then
    expect(store.login).toHaveBeenCalledWith(JSON.stringify(mockUser));
    expect(localStorageSpy).toHaveBeenCalledWith('jwt', mockJwt);
  });
});

// Verify that null is returned when attempting to log in without a store
describe("Given no store in the Login class", () => {
  test("When login method is called, Then it should return null", async () => {
    // Given
    const login = new Login({
      document: document,
      localStorage: window.localStorage,
      onNavigate: jest.fn(),
      PREVIOUS_LOCATION: "",
      // we do not provide a store for this test
    });

    const mockUser = {
      email: 'test@example.com',
      password: 'testpassword',
    };

    // When
    const result = await login.login(mockUser);

    // Then
    expect(result).toBeNull();
  });
});
