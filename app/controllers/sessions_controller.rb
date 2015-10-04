class SessionsController < ApplicationController

  def new
  end

  def create
    user = User.find_by_email(params[:email])
    user = user && user.authenticate(params[:password])
    
    if user
      session[:user_id] = user.id
      redirect_to root_path, notice: "Signed in successfully!"
    else
      flash.now.alert = "Invalid email and/or password"
      render :new
    end
  end

  def destroy
    session[:user_id] = nil
    redirect_to root_path, notice: "Signed out successfully!"
  end
end
