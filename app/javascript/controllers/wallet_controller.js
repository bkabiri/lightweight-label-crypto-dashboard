// app/javascript/controllers/wallet_controller.js
import { Controller } from "@hotwired/stimulus"

// Handles MetaMask connect, network display, and persistence to Rails
export default class extends Controller {
  static targets = ["address", "network", "button", "status"]

  connect() {
    if (window.ethereum) {
      // Clean up and rebind listeners each connect()
      window.ethereum.removeAllListeners?.("accountsChanged")
      window.ethereum.removeAllListeners?.("chainChanged")
      window.ethereum.on?.("accountsChanged", (accounts) => this.handleAccountsChanged(accounts))
      window.ethereum.on?.("chainChanged", () => this.updateNetworkUI())

      this.renderStatus("Connect your wallet", false)
    } else {
      this.renderStatus("MetaMask not detected. Please install the extension.", true)
      this.disableButton()
    }
  }

  async connectWallet() {
    if (!window.ethereum) {
      this.renderStatus("MetaMask not detected. Please install the extension.", true)
      return
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      await this.handleAccountsChanged(accounts)
    } catch (err) {
      if (err?.code === 4001) {
        this.renderStatus("Connection request rejected.", true)
      } else {
        this.renderStatus(`Error: ${err?.message || err}`, true)
      }
    }
  }

  async handleAccountsChanged(accounts) {
    if (!accounts || accounts.length === 0) {
      this.renderDisconnected()
      return
    }
    const addr = accounts[0]
    this.addressTarget.textContent = addr
    await this.updateNetworkUI()
    await this.persist(addr)
    this.renderStatus("Connected", false)
    if (this.hasButtonTarget) {
      this.buttonTarget.textContent = "Connected"
      this.buttonTarget.classList.remove("bg-black")
      this.buttonTarget.classList.add("bg-gray-800")
    }
  }

  async updateNetworkUI() {
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      this.networkTarget.textContent = this.chainName(chainId)
    } catch {
      this.networkTarget.textContent = "Unknown"
    }
  }

  chainName(chainIdHex) {
    const map = {
      "0x1": "Ethereum Mainnet",
      "0x89": "Polygon",
      "0xa": "Optimism",
      "0x38": "BNB Smart Chain",
      "0xaa36a7": "Sepolia",
      "0x5": "Goerli (deprecated)"
    }
    return map[chainIdHex?.toLowerCase()] || `Chain ${parseInt(chainIdHex, 16)}`
  }

  async persist(address) {
    try {
      const token = document.querySelector("meta[name='csrf-token']")?.content
      const network = this.hasNetworkTarget ? this.networkTarget.textContent : ""
      const res = await fetch("/wallets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": token,
          "Accept": "application/json"
        },
        body: JSON.stringify({ wallet: { address, network } })
      })
      if (!res.ok) throw new Error("Save failed")
    } catch (e) {
      this.renderStatus("Could not save wallet on server.", true)
    }
  }

  // UI helpers
  renderDisconnected() {
    if (this.hasAddressTarget) this.addressTarget.textContent = ""
    if (this.hasNetworkTarget) this.networkTarget.textContent = ""
    if (this.hasButtonTarget) {
      this.buttonTarget.textContent = "Connect MetaMask"
      this.buttonTarget.classList.add("bg-black")
    }
    this.renderStatus("Disconnected", false)
  }

  renderStatus(msg, isError) {
    if (!this.hasStatusTarget) return
    this.statusTarget.textContent = msg
    this.statusTarget.className = "text-xs mt-2 " + (isError ? "text-red-600" : "text-gray-500")
  }

  disableButton() {
    if (!this.hasButtonTarget) return
    this.buttonTarget.disabled = true
    this.buttonTarget.classList.add("opacity-60", "cursor-not-allowed")
  }
}