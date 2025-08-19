class WalletsController < ApplicationController
  before_action :authenticate_user!

  def create
    # Upsert by address for this user
    wallet = current_user.wallets.find_or_initialize_by(address: wallet_params[:address])
    wallet.network = wallet_params[:network]
    if wallet.save
      render json: { ok: true }
    else
      render json: { ok: false, errors: wallet.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def wallet_params
    params.require(:wallet).permit(:address, :network)
  end
end